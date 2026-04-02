'use client'

import { useAppStore, type ModelOption } from '@/stores/useAppStore'

interface ModelSelectorProps {
  compact?: boolean
}

const models: {
  id: ModelOption
  name: string
  description: string
}[] = [
  { id: 'opus-4.6', name: 'Opus 4.6', description: 'Most capable' },
  { id: 'sonnet-4.6', name: 'Sonnet 4.6', description: 'Fast & efficient' },
]

export function ModelSelector({ compact = false }: ModelSelectorProps) {
  const { selectedModel, setSelectedModel } = useAppStore()

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-[rgba(255,255,255,0.08)] backdrop-blur-[16px] bg-[rgba(20,26,34,0.7)] ${
        compact ? 'p-0.5' : 'p-1'
      }`}
    >
      {models.map((model) => {
        const isActive = selectedModel === model.id
        return (
          <button
            key={model.id}
            type="button"
            onClick={() => setSelectedModel(model.id)}
            className={`
              relative flex flex-col items-center rounded-md transition-all
              ${compact ? 'px-2.5 py-1' : 'px-3 py-1.5'}
              ${
                isActive
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5'
              }
            `}
            aria-pressed={isActive}
          >
            <span className={`text-xs font-semibold leading-tight ${compact ? '' : 'text-sm'}`}>
              {model.name}
            </span>
            {!compact && (
              <span
                className={`text-[10px] leading-tight mt-0.5 ${
                  isActive ? 'text-white/70' : 'text-text-tertiary'
                }`}
              >
                {model.description}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
