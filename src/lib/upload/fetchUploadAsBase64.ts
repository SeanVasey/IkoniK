import { createAdminClient } from '@/lib/supabase/admin';
import { UPLOAD_BUCKET } from '@/lib/constants';

interface UploadBase64Result {
  base64: string;
  mimeType: string;
}

/**
 * Download a user's uploaded file from Supabase Storage and return it as a
 * base64-encoded string with its detected MIME type. Used by the Claude AI
 * pipeline routes that accept `uploadPath` as an alternative to inline base64.
 *
 * @param uploadPath - The object path in the uploads bucket (e.g. `users/{uid}/{uuid}-file.png`)
 * @param userId     - The authenticated user's ID, used for ownership verification
 */
export async function fetchUploadAsBase64(
  uploadPath: string,
  userId: string,
): Promise<UploadBase64Result> {
  // Ownership check — the path must be scoped to this user
  const expectedPrefix = `users/${userId}/`;
  if (!uploadPath.startsWith(expectedPrefix)) {
    throw new Error('Access denied — upload path does not belong to this user');
  }

  const admin = createAdminClient();

  const { data: blob, error } = await admin.storage
    .from(UPLOAD_BUCKET)
    .download(uploadPath);

  if (error || !blob) {
    throw new Error('Failed to download upload: ' + (error?.message ?? 'not found'));
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mimeType = blob.type || 'application/octet-stream';

  return { base64, mimeType };
}
