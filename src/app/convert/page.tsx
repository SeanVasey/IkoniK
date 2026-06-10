'use client'

import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useConvertStore } from '@/stores/useConvertStore'
import type {
  AnalysisLayer,
  AnalysisPreprocessing,
  ConversionAnalysis,
} from '@/stores/useConvertStore'
import { useAppStore } from '@/stores/useAppStore'
import { DropZone } from '@/components/upload/DropZone'
import { ComparisonView } from '@/components/canvas/ComparisonView'
import { SourceReport } from '@/components/upload/SourceReport'
import { GlassCard } from '@/components/shared/GlassCard'
import { FidelityBadge } from '@/components/shared/FidelityBadge'
import { AnalysisReport } from '@/components/convert/AnalysisReport'
import { PipelineProgress, type PipelineStep } from '@/components/convert/PipelineProgress'

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

/** Map store model option to API model ID */
const MODEL_MAP: Record<string, string> = {
  'fable-5': 'claude-fable-5',
  'opus-4.8': 'claude-opus-4-8',
  'sonnet-4.6': 'claude-sonnet-4-6',
}

/** Human-readable model names for status messages */
const MODEL_LABELS: Record<string, string> = {
  'fable-5': 'Fable 5',
  'opus-4.8': 'Opus 4.8',
  'sonnet-4.6': 'Sonnet 4.6',
}

function isPreprocessing(value: unknown): value is AnalysisPreprocessing {
  if (typeof value !== 'object' || value === null) return false
  const p = value as Record<string, unknown>
  return (
    typeof p.sharpen === 'boolean' &&
    typeof p.threshold === 'boolean' &&
    typeof p.trimPadding === 'number'
  )
}

function isLayer(value: unknown): value is AnalysisLayer {
  if (typeof value !== 'object' || value === null) return false
  const l = value as Record<string, unknown>
  return (
    typeof l.name === 'string' &&
    typeof l.color === 'string' &&
    typeof l.order === 'number'
  )
}

/**
 * Parse the raw analysis text from Claude into a structured report.
 * Tolerates markdown code fences and missing optional fields; falls back to
 * showing the raw text as the analysis if the payload isn't valid JSON.
 */
function parseAnalysis(raw: string): ConversionAnalysis {
  const fallback: ConversionAnalysis = {
    analysis: raw,
    engine: 'unknown',
    strategy: 'auto',
    expectedFidelity: 'interpretation',
  }

  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(stripped) as Record<string, unknown>
  } catch {
    return fallback
  }
  if (typeof parsed !== 'object' || parsed === null) return fallback

  return {
    analysis: typeof parsed.analysis === 'string' ? parsed.analysis : raw,
    engine: typeof parsed.engine === 'string' ? parsed.engine : 'unknown',
    strategy: typeof parsed.strategy === 'string' ? parsed.strategy : 'auto',
    expectedFidelity:
      typeof parsed.expectedFidelity === 'string'
        ? parsed.expectedFidelity
        : 'interpretation',
    preprocessing: isPreprocessing(parsed.preprocessing)
      ? parsed.preprocessing
      : undefined,
    layers: Array.isArray(parsed.layers)
      ? parsed.layers.filter(isLayer)
      : undefined,
    warnings: Array.isArray(parsed.warnings)
      ? parsed.warnings.filter((w): w is string => typeof w === 'string')
      : undefined,
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ConvertPage() {
  const {
    sourceFile,
    sourcePreview,
    instantPreview,
    uploadPath,
    resultSvg,
    analysis,
    metrics,
    isAnalyzing,
    isConverting,
    isUploading,
    error,
    setAnalyzing,
    setConverting,
    setAnalysis,
    setResultSvg,
    setMetrics,
    setError,
    reset,
  } = useConvertStore()

  const selectedModel = useAppStore((s) => s.selectedModel)
  const [copied, setCopied] = useState(false)

  const modelLabel = MODEL_LABELS[selectedModel] ?? 'Claude'

  const handleAnalyze = useCallback(async () => {
    if (!sourcePreview) return

    setAnalyzing(true)
    setError(null)

    const model = MODEL_MAP[selectedModel] ?? 'claude-sonnet-4-6'

    // Extract base64 data and media type from the data URL
    const match = sourcePreview.match(/^data:(image\/\w+);base64,(.+)$/)
    const mediaType = match?.[1] ?? 'image/png'
    const imageBase64 = match?.[2] ?? sourcePreview

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          uploadPath
            ? { model, uploadPath }
            : { model, imageBase64, mediaType }
        ),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Analysis failed')
      }

      const data = (await response.json()) as { analysis: string }

      // The API returns raw JSON text from Claude — parse it
      setAnalysis(parseAnalysis(data.analysis))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }, [sourcePreview, uploadPath, selectedModel, setAnalyzing, setError, setAnalysis])

  const handleConvert = useCallback(async () => {
    if (!sourcePreview || !analysis) return

    setConverting(true)
    setError(null)

    const model = MODEL_MAP[selectedModel] ?? 'claude-sonnet-4-6'

    // Extract base64 from the data URL
    const match = sourcePreview.match(/^data:(image\/\w+);base64,(.+)$/)
    const imageBase64 = match?.[2] ?? sourcePreview

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          imageBase64,
          analysis: JSON.stringify(analysis),
        }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Conversion failed')
      }

      const data = (await response.json()) as {
        svg: string
        analysis?: string
      }

      // The SVG may be returned inside a JSON wrapper from Claude
      let svg = data.svg
      if (svg.startsWith('{')) {
        try {
          const parsed = JSON.parse(svg)
          svg = parsed.svg ?? svg
        } catch {
          // Use as-is
        }
      }

      setResultSvg(svg)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
    } finally {
      setConverting(false)
    }
  }, [sourcePreview, analysis, selectedModel, setConverting, setError, setResultSvg])

  const handleDownloadSvg = useCallback(() => {
    if (!resultSvg) return

    const blob = new Blob([resultSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = sourceFile
      ? sourceFile.name.replace(/\.[^.]+$/, '.svg')
      : 'converted.svg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [resultSvg, sourceFile])

  const handleDownloadPng = useCallback(() => {
    if (!resultSvg) return

    const svgBlob = new Blob([resultSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || 1024
      canvas.height = img.naturalHeight || 1024
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (!blob) return
        const pngUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = pngUrl
        a.download = sourceFile
          ? sourceFile.name.replace(/\.[^.]+$/, '-converted.png')
          : 'converted.png'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(pngUrl)
      }, 'image/png')
      URL.revokeObjectURL(url)
    }

    img.src = url
  }, [resultSvg, sourceFile])

  const handleCopySvg = useCallback(async () => {
    if (!resultSvg) return
    try {
      await navigator.clipboard.writeText(resultSvg)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy to clipboard')
    }
  }, [resultSvg, setError])

  const resultSize = useMemo(
    () => (resultSvg ? new Blob([resultSvg]).size : 0),
    [resultSvg]
  )

  // Derive pipeline state for the progress display
  const pipelineSteps: PipelineStep[] = useMemo(() => {
    const analyzeErrored = Boolean(error) && !isAnalyzing && !analysis
    const convertErrored =
      Boolean(error) && !isConverting && Boolean(analysis) && !resultSvg

    return [
      {
        id: 'upload',
        label: 'Upload',
        status: isUploading ? 'active' : sourceFile ? 'done' : 'pending',
      },
      {
        id: 'analyze',
        label: 'Analyze',
        status: isAnalyzing
          ? 'active'
          : analysis
            ? 'done'
            : analyzeErrored
              ? 'error'
              : 'pending',
      },
      {
        id: 'convert',
        label: 'Convert',
        status: isConverting
          ? 'active'
          : resultSvg
            ? 'done'
            : convertErrored
              ? 'error'
              : 'pending',
      },
    ]
  }, [sourceFile, isUploading, isAnalyzing, analysis, isConverting, resultSvg, error])

  const statusText = isUploading
    ? 'Uploading image…'
    : isAnalyzing
      ? `Analyzing image with ${modelLabel}…`
      : isConverting
        ? `Generating SVG with ${modelLabel}…`
        : resultSvg
          ? 'Conversion complete — ready to download'
          : analysis
            ? 'Analysis complete — ready to convert'
            : sourceFile
              ? 'Ready to analyze'
              : undefined

  const svgToShow = resultSvg ?? instantPreview

  return (
    <div className="mx-auto max-w-screen-2xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main area */}
        <div className="min-w-0">
          {!sourceFile ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DropZone className="mx-auto max-w-2xl" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <ComparisonView
                sourceImage={sourcePreview}
                svgContent={svgToShow}
              />

              {/* Metrics display */}
              {metrics && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center gap-4 rounded-lg bg-pewter px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      PSNR
                    </span>
                    <span className="font-mono text-sm text-text-primary">
                      {metrics.psnr.toFixed(1)} dB
                    </span>
                  </div>
                  <div className="h-4 w-px bg-border-subtle" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      SSIM
                    </span>
                    <span className="font-mono text-sm text-text-primary">
                      {metrics.ssim.toFixed(4)}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-border-subtle" />
                  <FidelityBadge
                    label={
                      metrics.fidelityLabel as
                        | 'exact_trace'
                        | 'faithful_recreation'
                        | 'interpretation'
                    }
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <GlassCard className="p-5">
            <h2 className="text-lg font-semibold text-text-primary">
              Convert
            </h2>

            <div className="mt-4 space-y-4">
              {/* Pipeline progress */}
              {sourceFile && (
                <PipelineProgress steps={pipelineSteps} statusText={statusText} />
              )}

              {/* File info */}
              {sourceFile && sourcePreview && (
                <SourceReport file={sourceFile} preview={sourcePreview} />
              )}

              {/* Analysis report */}
              {analysis && <AnalysisReport analysis={analysis} />}

              {/* Action buttons */}
              <div className="space-y-2">
                {/* Analyze */}
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!sourceFile || isAnalyzing || isConverting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isAnalyzing ? (
                    <>
                      <Spinner />
                      Analyzing...
                    </>
                  ) : analysis ? (
                    'Re-analyze Image'
                  ) : (
                    'Analyze Image'
                  )}
                </button>

                {/* Convert */}
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={!analysis || isAnalyzing || isConverting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent bg-accent-surface px-4 py-2.5 text-sm font-medium text-accent-light transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isConverting ? (
                    <>
                      <Spinner />
                      Converting...
                    </>
                  ) : (
                    'Convert to SVG'
                  )}
                </button>

                {/* Download section */}
                {resultSvg && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 rounded-lg bg-pewter p-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                        Download Result
                      </h3>
                      <span className="font-mono text-[11px] text-text-tertiary">
                        {formatFileSize(resultSize)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadSvg}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-success/85"
                    >
                      <DownloadIcon />
                      Download SVG
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadPng}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-info/15 px-3 py-2 text-sm font-medium text-info transition-colors hover:bg-info/25"
                      >
                        <DownloadIcon />
                        PNG
                      </button>
                      <button
                        type="button"
                        onClick={handleCopySvg}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary"
                        aria-live="polite"
                      >
                        {copied ? '✓ Copied' : 'Copy SVG'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Reset */}
                {sourceFile && (
                  <button
                    type="button"
                    onClick={reset}
                    className="w-full rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-secondary transition-colors hover:border-text-tertiary hover:text-text-primary"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Error display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error"
                >
                  {error}
                </motion.div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
