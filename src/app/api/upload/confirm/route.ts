import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { detectMimeFromBytes } from '@/lib/upload/validateMagicBytes';
import { sha256 } from '@/lib/upload/serverHelpers';
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_SIZE, UPLOAD_BUCKET } from '@/lib/constants';

interface ConfirmRequestBody {
  path: string;
  checksum: string;
}

/**
 * POST /api/upload/confirm — Post-upload validation for the signed-URL path.
 *
 * After the client uploads directly to Supabase Storage via a signed URL,
 * this endpoint downloads the file, validates magic bytes + checksum, and
 * either persists metadata (success) or deletes the object (failure).
 */
export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────
  const auth = await verifyAuth();
  if (auth.userId === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // ── Parse body ──────────────────────────────────────────────────────
  let body: ConfirmRequestBody;
  try {
    body = (await request.json()) as ConfirmRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { path, checksum } = body;
  if (!path || !checksum) {
    return NextResponse.json(
      { error: 'Missing required fields: path, checksum' },
      { status: 400 },
    );
  }

  // ── Ownership check ─────────────────────────────────────────────────
  const expectedPrefix = `users/${auth.userId}/`;
  if (!path.startsWith(expectedPrefix)) {
    return NextResponse.json(
      { error: 'Access denied — path does not belong to you' },
      { status: 403 },
    );
  }

  // ── Download the file from storage ──────────────────────────────────
  const admin = createAdminClient();

  const { data: blob, error: downloadError } = await admin.storage
    .from(UPLOAD_BUCKET)
    .download(path);

  if (downloadError || !blob) {
    return NextResponse.json(
      { error: 'File not found in storage. Was the upload completed?' },
      { status: 404 },
    );
  }

  const buffer = new Uint8Array(await blob.arrayBuffer());

  // ── Size check ──────────────────────────────────────────────────────
  if (buffer.length > MAX_UPLOAD_SIZE) {
    await admin.storage.from(UPLOAD_BUCKET).remove([path]);
    return NextResponse.json(
      { error: `File exceeds ${MAX_UPLOAD_SIZE / (1024 * 1024)} MB limit` },
      { status: 400 },
    );
  }

  // ── Magic byte validation ───────────────────────────────────────────
  const detectedMime = detectMimeFromBytes(buffer);
  if (!detectedMime || !(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(detectedMime)) {
    await admin.storage.from(UPLOAD_BUCKET).remove([path]);
    return NextResponse.json(
      { error: 'File content does not match any allowed image type — upload deleted' },
      { status: 400 },
    );
  }

  // ── Checksum verification ───────────────────────────────────────────
  const hash = sha256(buffer);
  if (hash !== checksum) {
    await admin.storage.from(UPLOAD_BUCKET).remove([path]);
    return NextResponse.json(
      { error: 'Checksum mismatch — file may have been tampered with — upload deleted' },
      { status: 400 },
    );
  }

  // ── Persist metadata ────────────────────────────────────────────────
  const filename = path.split('/').pop() ?? 'upload';

  const { error: dbError } = await admin.from('uploads').insert({
    user_id: auth.userId,
    object_path: path,
    filename,
    mime_type: detectedMime,
    size_bytes: buffer.length,
    sha256: hash,
  });

  if (dbError) {
    await admin.storage.from(UPLOAD_BUCKET).remove([path]);
    return NextResponse.json(
      { error: 'Failed to record upload metadata' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    path,
    mime: detectedMime,
    size: buffer.length,
    sha256: hash,
  });
}
