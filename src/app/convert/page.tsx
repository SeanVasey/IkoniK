'use client'

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useConvertStore } from '@/stores/useConvertStore'
import { DropZone } from '@/components/upload/DropZone'
import { ComparisonView } from '@/components/canvas/ComparisonView'
import { SourceReport } from '@/components/upload/SourceReport'
import { GlassCard } from '@/components/shared/GlassCard'
import { FidelityBadge } from '@/components/shared/FidelityBadge'

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

export default function ConvertPage() {
  const {
    sourceFile,
    sourcePreview,
    instantPreview,
    resultSvg,
    analysis,
    metrics,
    isAnalyzing,
    isConverting,
    error,
    setAnalyzing,
    setConverting,
    setAnalysis,
    setResultSvg,
    setMetrics,
    setError,
    reset,
  } = useConvertStore()

  const handleAnalyze = useCallback(async () => {
    if (!sourcePreview) return

    setAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: sourcePreview }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Analysis failed')
      }

      const data = (await response.json()) as {
        analysis: string
        engine: string
        strategy: string
        expectedFidelity: string
      }
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }, [sourcePreview, setAnalyzing, setError, setAnalysis])

  const handleConvert = useCallback(async () => {
    if (!sourcePreview) return

    setConverting(true)
    setError(null)

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: sourcePreview, analysis }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Conversion failed')
      }

      const data = (await response.json()) as {
        svg: string
        metrics?: { psnr: number; ssim: number; fidelityLabel: string }
      }
      setResultSvg(data.svg)
      if (data.metrics) {
        setMetrics(data.metrics)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
    } finally {
      setConverting(false)
    }
  }, [sourcePreview, analysis, setConverting, setError, setResultSvg, setMetrics])

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
              {/* File info */}
              {sourceFile && sourcePreview && (
                <SourceReport file={sourceFile} preview={sourcePreview} />
              )}

              {/* Analysis info */}
              {analysis && (
                <div className="rounded-lg bg-accent-surface p-3 text-sm">
                  <p className="font-medium text-accent-light">
                    Analysis Complete
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Engine: {analysis.engine} -- Strategy: {analysis.strategy}
                  </p>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    Expected fidelity: {analysis.expectedFidelity}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2">
                {/* Analyze */}
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!sourceFile || isAnalyzing}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isAnalyzing ? (
                    <>
                      <Spinner />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Image'
                  )}
                </button>

                {/* Convert */}
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={!analysis || isConverting}
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

                {/* Download buttons */}
                {resultSvg && (
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDownloadSvg}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-sm font-medium text-success transition-colors hover:bg-success/25"
                    >
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
                      SVG
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPng}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-info/15 px-3 py-2 text-sm font-medium text-info transition-colors hover:bg-info/25"
                    >
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
                      PNG
                    </button>
                  </div>
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
