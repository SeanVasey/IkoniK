'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PreviewCanvas } from '@/components/canvas/PreviewCanvas'

type ViewMode = 'side-by-side' | 'source' | 'result'

interface ComparisonViewProps {
  sourceImage: string | null
  svgContent: string | null
}

const tabs: { value: ViewMode; label: string }[] = [
  { value: 'side-by-side', label: 'Side by Side' },
  { value: 'source', label: 'Source' },
  { value: 'result', label: 'Result' },
]

export function ComparisonView({ sourceImage, svgContent }: ComparisonViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (e.matches && viewMode === 'side-by-side') {
        setViewMode('source')
      }
    }

    setIsMobile(mq.matches)
    if (mq.matches && viewMode === 'side-by-side') {
      setViewMode('source')
    }

    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
    // Only run on mount and when viewMode changes from external trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredTabs = isMobile
    ? tabs.filter((t) => t.value !== 'side-by-side')
    : tabs

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border-subtle px-3 pt-3 pb-0">
        {filteredTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setViewMode(tab.value)}
            className={`
              relative px-3 py-2 text-sm font-medium transition-colors rounded-t-md
              ${
                viewMode === tab.value
                  ? 'text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              }
            `}
          >
            {tab.label}
            {viewMode === tab.value && (
              <motion.span
                layoutId="comparison-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="p-3">
        <AnimatePresence mode="wait">
          {viewMode === 'side-by-side' && (
            <motion.div
              key="side-by-side"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 gap-3"
            >
              <SourcePanel sourceImage={sourceImage} />
              <PreviewCanvas svgContent={svgContent} label="Result" />
            </motion.div>
          )}

          {viewMode === 'source' && (
            <motion.div
              key="source"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SourcePanel sourceImage={sourceImage} />
            </motion.div>
          )}

          {viewMode === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <PreviewCanvas svgContent={svgContent} label="Result" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function SourcePanel({ sourceImage }: { sourceImage: string | null }) {
  return (
    <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-border-subtle">
      <div className="absolute top-3 left-3 z-10 rounded-md bg-charcoal/80 px-2 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm">
        Source
      </div>
      <div className="checkerboard flex min-h-[300px] items-center justify-center">
        {sourceImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sourceImage}
            alt="Source image for conversion"
            className="max-h-[500px] max-w-full object-contain"
          />
        ) : (
          <p className="text-sm text-text-tertiary">No source image</p>
        )}
      </div>
    </div>
  )
}
