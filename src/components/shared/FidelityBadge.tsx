type FidelityLevel = 'exact_trace' | 'faithful_recreation' | 'interpretation'

interface FidelityBadgeProps {
  label: FidelityLevel
}

const config: Record<
  FidelityLevel,
  { text: string; icon: string; bgClass: string; textClass: string }
> = {
  exact_trace: {
    text: 'Exact Trace',
    icon: '\u2713',
    bgClass: 'bg-success/15',
    textClass: 'text-success',
  },
  faithful_recreation: {
    text: 'Faithful Recreation',
    icon: '~',
    bgClass: 'bg-warning/15',
    textClass: 'text-warning',
  },
  interpretation: {
    text: 'Interpretation',
    icon: 'i',
    bgClass: 'bg-error/15',
    textClass: 'text-error',
  },
}

export function FidelityBadge({ label }: FidelityBadgeProps) {
  const { text, icon, bgClass, textClass } = config[label]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${bgClass} ${textClass}`}
    >
      <span className="text-[10px] font-bold leading-none" aria-hidden="true">
        {icon}
      </span>
      {text}
    </span>
  )
}
