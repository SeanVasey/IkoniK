interface SectionLabelProps {
  children: string
  className?: string
}

/** Suite-standard section label: letterspaced caps with a thin trailing rule. */
export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="font-display text-sm tracking-[0.25em] text-text-secondary">
        {children}
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-border-subtle" />
    </div>
  )
}
