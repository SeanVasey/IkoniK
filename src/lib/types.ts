/** User profile stored in the database */
export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  provider: string;
  status: 'pending' | 'approved' | 'suspended';
  role: 'user' | 'admin';
  created_at: string;
  last_sign_in: string | null;
}

/** Record of a single API call for usage tracking */
export interface UsageLog {
  id: string;
  user_id: string;
  endpoint: string;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  created_at: string;
}

/** Numeric fidelity metrics comparing raster source to SVG output */
export interface ConversionMetrics {
  psnr: number;
  ssim: number;
  meanDiff: number;
  maxDiff: number;
  fidelityLabel: 'exact_trace' | 'faithful_recreation' | 'interpretation';
}

/** Structured response from the Vector Forge AI pipeline */
export interface VectorForgeResponse {
  analysis: string;
  engine: 'potrace' | 'vtracer';
  strategy: string;
  preprocessing: {
    sharpen: boolean;
    threshold: boolean;
    trimPadding: number;
  };
  layers: Array<{
    name: string;
    color: string;
    params: Record<string, unknown>;
    order: number;
  }>;
  svg: string;
  warnings: string[];
  expectedFidelity: string;
  metrics: {
    pathCount: number;
    estimatedSize: string;
  };
}

/** Available Claude model definition */
export interface ClaudeModel {
  id: string;
  name: string;
  description: string;
}

/** Metadata record persisted after a successful file upload */
export interface UploadRecord {
  id: string;
  user_id: string;
  object_path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  created_at: string;
}
