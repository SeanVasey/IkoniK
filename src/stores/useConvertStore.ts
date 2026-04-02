import { create } from 'zustand';

interface ConversionMetrics {
  psnr: number;
  ssim: number;
  fidelityLabel: string;
}

interface ConversionAnalysis {
  analysis: string;
  engine: string;
  strategy: string;
  expectedFidelity: string;
}

interface ConvertState {
  sourceFile: File | null;
  sourcePreview: string | null;
  instantPreview: string | null;
  resultSvg: string | null;
  analysis: ConversionAnalysis | null;
  metrics: ConversionMetrics | null;
  isAnalyzing: boolean;
  isConverting: boolean;
  isOptimizing: boolean;
  error: string | null;

  setSourceFile: (file: File | null) => void;
  setSourcePreview: (preview: string | null) => void;
  setInstantPreview: (svg: string | null) => void;
  setResultSvg: (svg: string | null) => void;
  setAnalysis: (analysis: ConversionAnalysis | null) => void;
  setMetrics: (metrics: ConversionMetrics | null) => void;
  setError: (error: string | null) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setConverting: (converting: boolean) => void;
  setOptimizing: (optimizing: boolean) => void;
  reset: () => void;
}

const initialState = {
  sourceFile: null,
  sourcePreview: null,
  instantPreview: null,
  resultSvg: null,
  analysis: null,
  metrics: null,
  isAnalyzing: false,
  isConverting: false,
  isOptimizing: false,
  error: null,
};

export const useConvertStore = create<ConvertState>((set) => ({
  ...initialState,

  setSourceFile: (sourceFile) => set({ sourceFile }),
  setSourcePreview: (sourcePreview) => set({ sourcePreview }),
  setInstantPreview: (instantPreview) => set({ instantPreview }),
  setResultSvg: (resultSvg) => set({ resultSvg }),
  setAnalysis: (analysis) => set({ analysis }),
  setMetrics: (metrics) => set({ metrics }),
  setError: (error) => set({ error }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setConverting: (isConverting) => set({ isConverting }),
  setOptimizing: (isOptimizing) => set({ isOptimizing }),
  reset: () => set(initialState),
}));
