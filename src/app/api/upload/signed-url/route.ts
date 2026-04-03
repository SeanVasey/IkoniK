import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildObjectPath } from '@/lib/upload/serverHelpers';
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_SIZE, UPLOAD_BUCKET } from '@/lib/constants';

interface SignedUrlRequestBody {
  filename: string;
  mime: string;
  size: number;
  checksum: string;
}

/**
 * POST /api/upload/signed-url — Mint a short-lived signed upload URL for
 * files > 4.5 MB (up to 10 MB). The client uploads directly to Supabase
 * Storage, then calls /api/upload/confirm for post-upload validation.
 */
export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────
  const auth = await verifyAuth();
  if (auth.userId === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // ── Parse body ──────────────────────────────────────────────────────
  let body: SignedUrlRequestBody;
  try {
    body = (await request.json()) as SignedUrlRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { filename, mime, size, checksum } = body;

  if (!filename || !mime || !size || !checksum) {
    return NextResponse.json(
      { error: 'Missing required fields: filename, mime, size, checksum' },
      { status: 400 },
    );
  }

  // ── Pre-flight validation ───────────────────────────────────────────
  if (size > MAX_UPLOAD_SIZE) {
    return NextResponse.json(
      { error: `File exceeds ${MAX_UPLOAD_SIZE / (1024 * 1024)} MB limit` },
      { status: 400 },
    );
  }

  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(mime)) {
    return NextResponse.json(
      { error: 'MIME type not allowed. Accepted: PNG, JPEG, WebP, GIF' },
      { status: 400 },
    );
  }

  // ── Generate path & signed URL ──────────────────────────────────────
  const objectPath = buildObjectPath(auth.userId, filename);
  const admin = createAdminClient();

  const { data, error } = await admin.storage
    .from(UPLOAD_BUCKET)
    .createSignedUploadUrl(objectPath);

  if (error || !data) {
    return NextResponse.json(
      { error: 'Failed to create signed upload URL: ' + (error?.message ?? 'unknown') },
      { status: 500 },
    );
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: objectPath,
    checksum,
  });
}
