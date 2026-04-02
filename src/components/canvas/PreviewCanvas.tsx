'use client'

import { useState, useCallback } from 'react'

type BackgroundMode = 'checkerboard' | 'dark' | 'light'

const ZOOM_STEP = 0.25
const ZOOM_MIN = 0.25
const ZOOM_MAX = 4

interface PreviewCanvasProps {
  svgContent: string | null
  label?: string
}

export function PreviewCanvas({ svgContent, label }: PreviewCanvasProps) {
  const [zoom, setZoom] = useState(1)
  const [bgMode, setBgMode] = useState<BackgroundMode>('checkerboard')

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN))
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoom(1)
  }, [])

  const toggleBackground = useCallback(() => {
    setBgMode((prev) => {
      if (prev === 'checkerboard') return 'dark'
      if (prev === 'dark') return 'light'
      return 'checkerboard'
    })
  }, [])

  const bgClass =
    bgMode === 'checkerboard'
      ? 'checkerboard'
      : bgMode === 'dark'
        ? 'bg-void'
        : 'bg-white'

  return (
    <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-border-subtle">
      {/* Label */}
      {label && (
        <div className="absolute top-3 left-3 z-10 rounded-md bg-charcoal/80 px-2 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm">
          {label}
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
        {/* Background toggle */}
        <button
          type="button"
          onClick={toggleBackground}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-charcoal/80 text-text-secondary backdrop-blur-sm transition-colors hover:text-text-primary"
          aria-label={`Switch background (current: ${bgMode})`}
          title={`Background: ${bgMode}`}
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
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </button>

        <div className="mx-1 h-4 w-px bg-border-subtle" />

        {/* Zoom out */}
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoom <= ZOOM_MIN}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-charcoal/80 text-text-secondary backdrop-blur-sm transition-colors hover:text-text-primary disabled:opacity-30"
          aria-label="Zoom out"
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
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* Zoom level */}
        <button
          type="button"
          onClick={handleZoomReset}
          className="flex h-7 min-w-[40px] items-center justify-center rounded-md bg-charcoal/80 px-1 text-[11px] font-mono text-text-secondary backdrop-blur-sm transition-colors hover:text-text-primary"
          aria-label="Reset zoom"
          title="Click to reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>

        {/* Zoom in */}
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoom >= ZOOM_MAX}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-charcoal/80 text-text-secondary backdrop-blur-sm transition-colors hover:text-text-primary disabled:opacity-30"
          aria-label="Zoom in"
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* SVG Display Area */}
      <div
        className={`flex min-h-[300px] items-center justify-center overflow-auto ${bgClass}`}
      >
        {svgContent ? (
          <div
            className="transition-transform duration-150 ease-out"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <p className="text-sm text-text-tertiary">No preview available</p>
        )}
      </div>
    </div>
  )
}
