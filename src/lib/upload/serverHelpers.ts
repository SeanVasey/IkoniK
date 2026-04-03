import crypto from 'node:crypto';

/**
 * Compute a hex-encoded SHA-256 digest for the given buffer.
 * Uses Node's native crypto (available in Vercel serverless functions).
 */
export function sha256(data: Uint8Array): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Build a scoped, collision-resistant storage path for a user upload.
 * Format: `users/{userId}/{uuid}-{sanitised-filename}`
 */
export function buildObjectPath(userId: string, filename: string): string {
  const sanitised = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 128);
  return `users/${userId}/${crypto.randomUUID()}-${sanitised}`;
}
