import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { detectMimeFromBytes } from '@/lib/upload/validateMagicBytes';
import { sha256, buildObjectPath } from '@/lib/upload/serverHelpers';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_SIZE,
  PROXY_SIZE_LIMIT,
  UPLOAD_BUCKET,
} from '@/lib/constants';

/**
 * POST /api/upload — Proxy-mode upload for files <= PROXY_SIZE_LIMIT.
 *
 * Accepts multipart/form-data with:
 *   - file: the image file
 *   - checksum (optional): hex-encoded SHA-256 for integrity verification
 *
 * The file is fully validated (magic bytes, size, checksum) server-side
 * *before* it is persisted to Supabase Storage.
 */
export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────
  const auth = await verifyAuth();
  if (auth.userId === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // ── Parse form data ─────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Expected multipart/form-data' },
      { status: 400 },
    );
  }

  const file = formData.get('file');
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { error: 'Missing "file" field' },
      { status: 400 },
    );
  }

  const clientChecksum = formData.get('checksum');

  // ── Size checks ─────────────────────────────────────────────────────
  if (file.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json(
      { error: `File exceeds ${MAX_UPLOAD_SIZE / (1024 * 1024)} MB limit` },
      { status: 400 },
    );
  }

  if (file.size > PROXY_SIZE_LIMIT) {
    return NextResponse.json(
      {
        error: 'File too large for proxy upload. Use /api/upload/signed-url for files over 4.5 MB.',
        code: 'USE_SIGNED_URL',
      },
      { status: 413 },
    );
  }

  // ── Read buffer & validate magic bytes ──────────────────────────────
  const buffer = new Uint8Array(await file.arrayBuffer());

  const detectedMime = detectMimeFromBytes(buffer);
  if (!detectedMime || !(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(detectedMime)) {
    return NextResponse.json(
      { error: 'File content does not match any allowed image type (PNG, JPEG, WebP, GIF)' },
      { status: 400 },
    );
  }

  // ── Compute & verify checksum ───────────────────────────────────────
  const hash = sha256(buffer);
  if (typeof clientChecksum === 'string' && clientChecksum !== hash) {
    return NextResponse.json(
      { error: 'Checksum mismatch — file may have been corrupted in transit' },
      { status: 400 },
    );
  }

  // ── Upload to Supabase Storage ──────────────────────────────────────
  const filename = file instanceof File ? file.name : 'upload';
  const objectPath = buildObjectPath(auth.userId, filename);
  const admin = createAdminClient();

  const { error: uploadError } = await admin.storage
    .from(UPLOAD_BUCKET)
    .upload(objectPath, buffer, {
      contentType: detectedMime,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: 'Storage upload failed: ' + uploadError.message },
      { status: 500 },
    );
  }

  // ── Persist metadata ────────────────────────────────────────────────
  const { error: dbError } = await admin.from('uploads').insert({
    user_id: auth.userId,
    object_path: objectPath,
    filename,
    mime_type: detectedMime,
    size_bytes: buffer.length,
    sha256: hash,
  });

  if (dbError) {
    // Best-effort cleanup — don't leave orphaned storage objects
    await admin.storage.from(UPLOAD_BUCKET).remove([objectPath]);
    return NextResponse.json(
      { error: 'Failed to record upload metadata' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    path: objectPath,
    mime: detectedMime,
    size: buffer.length,
    sha256: hash,
  });
}
