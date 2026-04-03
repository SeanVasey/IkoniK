import { PROXY_SIZE_LIMIT, MAX_UPLOAD_SIZE } from '@/lib/constants';

/** Result returned by both upload paths. */
export interface UploadResult {
  path: string;
  mime: string;
  size: number;
  sha256: string;
}

/** Compute hex-encoded SHA-256 in the browser. */
async function computeSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Retry wrapper with exponential backoff + jitter.
 * Retries only on network errors, not on 4xx responses.
 */
async function withRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal,
  maxAttempts = 3,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn(signal);
    } catch (err) {
      lastError = err;
      if (signal.aborted) throw err;
      // Only retry on network-level errors, not HTTP error responses
      if (err instanceof TypeError && attempt < maxAttempts - 1) {
        const delay = Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 500;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Upload a file to the server using the hybrid approach:
 *  - Files <= 4.5 MB → proxy mode (POST /api/upload)
 *  - Files > 4.5 MB  → signed URL mode (mint → PUT → confirm)
 *
 * Computes SHA-256 client-side for integrity verification.
 * Supports cancellation via AbortController.
 */
export async function uploadFile(
  file: File,
  signal?: AbortSignal,
): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error(`File exceeds ${MAX_UPLOAD_SIZE / (1024 * 1024)} MB limit`);
  }

  const checksum = await computeSha256(file);
  const abortSignal = signal ?? new AbortController().signal;

  if (file.size <= PROXY_SIZE_LIMIT) {
    return proxyUpload(file, checksum, abortSignal);
  }
  return signedUrlUpload(file, checksum, abortSignal);
}

/** Proxy mode: stream file through our API route for pre-storage validation. */
async function proxyUpload(
  file: File,
  checksum: string,
  signal: AbortSignal,
): Promise<UploadResult> {
  return withRetry(async (sig) => {
    const form = new FormData();
    form.append('file', file);
    form.append('checksum', checksum);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form,
      signal: sig,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error ?? `Upload failed (${res.status})`);
    }

    return res.json() as Promise<UploadResult>;
  }, signal);
}

/** Signed URL mode: mint URL → PUT to Supabase → confirm with post-validation. */
async function signedUrlUpload(
  file: File,
  checksum: string,
  signal: AbortSignal,
): Promise<UploadResult> {
  // Step 1: Mint signed URL
  const mintRes = await withRetry(async (sig) => {
    const res = await fetch('/api/upload/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        mime: file.type,
        size: file.size,
        checksum,
      }),
      signal: sig,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error ?? `Failed to get upload URL (${res.status})`);
    }

    return res.json() as Promise<{
      signedUrl: string;
      token: string;
      path: string;
    }>;
  }, signal);

  // Step 2: Upload directly to Supabase Storage
  await withRetry(async (sig) => {
    const res = await fetch(mintRes.signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        Authorization: `Bearer ${mintRes.token}`,
      },
      body: file,
      signal: sig,
    });

    if (!res.ok) {
      throw new Error(`Direct upload failed (${res.status})`);
    }
  }, signal);

  // Step 3: Post-upload validation
  return withRetry(async (sig) => {
    const res = await fetch('/api/upload/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: mintRes.path,
        checksum,
      }),
      signal: sig,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error ?? `Validation failed (${res.status})`);
    }

    return res.json() as Promise<UploadResult>;
  }, signal);
}
