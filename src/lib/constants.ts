import type { ClaudeModel } from '@/lib/types';

/** Application name */
export const APP_NAME = 'IkoniK' as const;

/** Marketing tagline */
export const APP_TAGLINE = 'Claude-Powered Vector Graphics Studio' as const;

/** Brand identifier */
export const BRAND = 'VASEY/AI' as const;

/** Available Claude models for vector generation */
export const MODELS: readonly ClaudeModel[] = [
  {
    id: 'claude-opus-4-6',
    name: 'Opus 4.6',
    description: 'Most capable',
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Sonnet 4.6',
    description: 'Fast & efficient',
  },
] as const;

/** Human-readable labels for fidelity levels */
export const FIDELITY_LABELS: Record<string, string> = {
  exact_trace: 'Exact Trace',
  faithful_recreation: 'Faithful Recreation',
  interpretation: 'Interpretation',
} as const;

/** Maximum upload file size in bytes (10 MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** MIME types accepted for image uploads */
export const ACCEPTED_IMAGE_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

/** Supabase Storage bucket for user uploads */
export const UPLOAD_BUCKET = 'uploads';

/** Maximum upload file size in bytes (10 MB) — hard cap for all modes */
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

/**
 * Files at or below this size are uploaded via proxy mode (through our API
 * route) for full pre-storage validation. Larger files use the signed-URL
 * path with post-upload validation. Set to 4.5 MB to stay within Vercel
 * Hobby plan body-size limits.
 */
export const PROXY_SIZE_LIMIT = 4.5 * 1024 * 1024;
