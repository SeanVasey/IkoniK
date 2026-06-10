'use client'

import { FidelityBadge } from '@/components/shared/FidelityBadge'
import type { ConversionAnalysis } from '@/stores/useConvertStore'

const FIDELITY_LEVELS = ['exact_trace', 'faithful_recreation', 'interpretation'] as const
type FidelityLevel = (typeof FIDELITY_LEVELS)[number]

function isFidelityLevel(value: string): value is FidelityLevel {
  return (FIDELITY_LEVELS as readonly string[]).includes(value)
}

const ENGINE_HINTS: Record<string, string> = {
  potrace: 'Line art & limited-colour tracing',
  vtracer: 'Photographic & multi-colour tracing',
}

/** Only hex colours pass through to the inline swatch style */
function safeSwatchColor(color: string): string | undefined {
  return /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : undefined
}

interface AnalysisReportProps {
  analysis: ConversionAnalysis
}

/**
 * Renders the full Claude analysis: what the model saw, the engine and
 * strategy it chose, recommended preprocessing, detected layers, and any
 * warnings — so the user understands the plan before converting.
 */
export function AnalysisReport({ analysis }: AnalysisReportProps) {
  const preprocessing = analysis.preprocessing
  const preprocessingSteps: string[] = []
  if (preprocessing?.sharpen) preprocessingSteps.push('Sharpen edges')
  if (preprocessing?.threshold) preprocessingSteps.push('Apply threshold')
  if (preprocessing && preprocessing.trimPadding > 0) {
    preprocessingSteps.push(`Trim padding (keep ${preprocessing.trimPadding}px)`)
  }

  const layers = analysis.layers ?? []
  const warnings = analysis.warnings ?? []

  return (
    <section
      className="space-y-3 rounded-lg bg-accent-surface p-3 text-sm"
      aria-label="Image analysis report"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium text-accent-light">Analysis Report</h3>
        {isFidelityLevel(analysis.expectedFidelity) && (
          <FidelityBadge label={analysis.expectedFidelity} />
        )}
      </div>

      {analysis.analysis && (
        <p className="text-xs leading-relaxed text-text-secondary">{analysis.analysis}</p>
      )}

      <dl className="space-y-1.5 text-xs">
        <div className="flex items-baseline gap-2">
          <dt className="w-16 flex-shrink-0 font-medium uppercase tracking-wider text-text-tertiary">
            Engine
          </dt>
          <dd className="text-text-primary">
            <span className="font-mono">{analysis.engine}</span>
            {ENGINE_HINTS[analysis.engine] && (
              <span className="text-text-tertiary"> — {ENGINE_HINTS[analysis.engine]}</span>
            )}
          </dd>
        </div>
        <div className="flex items-baseline gap-2">
          <dt className="w-16 flex-shrink-0 font-medium uppercase tracking-wider text-text-tertiary">
            Strategy
          </dt>
          <dd className="text-text-secondary">{analysis.strategy}</dd>
        </div>
        <div className="flex items-baseline gap-2">
          <dt className="w-16 flex-shrink-0 font-medium uppercase tracking-wider text-text-tertiary">
            Prep
          </dt>
          <dd className="text-text-secondary">
            {preprocessingSteps.length > 0 ? preprocessingSteps.join(' · ') : 'None needed'}
          </dd>
        </div>
      </dl>

      {layers.length > 0 && (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Layers ({layers.length})
          </h4>
          <ul className="mt-1.5 space-y-1">
            {[...layers]
              .sort((a, b) => a.order - b.order)
              .map((layer) => (
                <li key={`${layer.order}-${layer.name}`} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-sm border border-border-subtle bg-pewter"
                    style={{ backgroundColor: safeSwatchColor(layer.color) }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-text-secondary">{layer.name}</span>
                  <span className="ml-auto font-mono text-[10px] text-text-tertiary">
                    {layer.color}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <ul className="space-y-1 rounded-md bg-warning/10 p-2 text-xs text-warning" role="alert">
          {warnings.map((warning) => (
            <li key={warning}>⚠ {warning}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
