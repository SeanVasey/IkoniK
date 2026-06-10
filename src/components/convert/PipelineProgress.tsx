'use client'

import { useEffect, useState } from 'react'
import { ProgressIndicator } from '@/components/shared/ProgressIndicator'

export type PipelineStepStatus = 'pending' | 'active' | 'done' | 'error'

export interface PipelineStep {
  id: string
  label: string
  status: PipelineStepStatus
}

interface PipelineProgressProps {
  steps: PipelineStep[]
  /** Status line shown under the bar, e.g. "Analyzing image with Claude…" */
  statusText?: string
}

/**
 * Stepped progress bar for the convert pipeline. Completed steps map to fixed
 * milestones; while a step is active the bar trickles asymptotically toward
 * the next milestone so long-running API calls show visible motion without
 * pretending to know their true duration.
 */
export function PipelineProgress({ steps, statusText }: PipelineProgressProps) {
  const total = steps.length
  const doneCount = steps.filter((s) => s.status === 'done').length
  const hasActive = steps.some((s) => s.status === 'active')

  const base = (doneCount / total) * 100
  const cap = hasActive ? ((doneCount + 0.92) / total) * 100 : base

  const [progress, setProgress] = useState(base)

  useEffect(() => {
    setProgress(base)
    if (!hasActive) return

    const interval = setInterval(() => {
      setProgress((p) => Math.min(cap, p + (cap - p) * 0.06))
    }, 200)
    return () => clearInterval(interval)
  }, [base, cap, hasActive])

  return (
    <div className="space-y-3">
      <ol className="flex items-center gap-1" aria-label="Conversion pipeline steps">
        {steps.map((step, index) => (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-1">
            <span
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                step.status === 'done'
                  ? 'bg-success/20 text-success'
                  : step.status === 'active'
                    ? 'animate-pulse bg-accent text-white'
                    : step.status === 'error'
                      ? 'bg-error/20 text-error'
                      : 'bg-pewter text-text-tertiary'
              }`}
              aria-hidden="true"
            >
              {step.status === 'done' ? '✓' : step.status === 'error' ? '!' : index + 1}
            </span>
            <span
              className={`truncate text-[11px] ${
                step.status === 'active'
                  ? 'font-medium text-text-primary'
                  : step.status === 'done'
                    ? 'text-text-secondary'
                    : 'text-text-tertiary'
              }`}
            >
              {step.label}
              {step.status === 'active' && <span className="sr-only"> (in progress)</span>}
              {step.status === 'done' && <span className="sr-only"> (complete)</span>}
            </span>
          </li>
        ))}
      </ol>

      <ProgressIndicator progress={progress} label={statusText} />
    </div>
  )
}
