export { Footer }
export default function Footer() {
  return (
    <footer className="bg-charcoal border-t border-border-subtle py-4 px-6">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Left: VM monogram */}
        <div className="flex h-7 w-7 items-center justify-center rounded border border-border-subtle bg-pewter">
          <span className="text-[10px] font-semibold tracking-tight text-text-secondary">
            VM
          </span>
        </div>

        {/* Center: Attribution */}
        <p className="text-text-tertiary text-sm">
          Built with Claude by{' '}
          <span className="text-text-secondary font-medium">VASEY/AI</span>
        </p>

        {/* Right: V/AI monogram */}
        <div className="flex h-7 w-7 items-center justify-center rounded border border-border-subtle bg-pewter">
          <span className="text-[10px] font-semibold tracking-tight text-text-secondary">
            V/AI
          </span>
        </div>
      </div>
    </footer>
  )
}
