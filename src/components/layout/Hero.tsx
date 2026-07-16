import { version } from '../../../package.json'

interface HeroProps {
  /** Render the compact variant (studio header) instead of the full landing hero */
  compact?: boolean
  className?: string
}

/**
 * VASEY/AI suite hero identity block: eyebrow, IK monogram + wordmark,
 * version pill and tagline over a low-opacity radial violet glow.
 * Shared by the landing page and the studio.
 */
export function Hero({ compact = false, className = '' }: HeroProps) {
  return (
    <section
      className={`relative text-center ${compact ? 'py-6' : 'py-10 md:py-14'} ${className}`}
    >
      {/* Radial violet glow — static, so reduced-motion safe */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-16 bottom-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 35%, rgba(124,92,252,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-light/80">
          VASEY/AI PRESENTS
        </p>

        <div className="mt-4 flex items-center justify-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-ios.svg"
            alt="IkoniK IK monogram"
            width={compact ? 56 : 88}
            height={compact ? 56 : 88}
            className="drop-shadow-[0_0_28px_rgba(124,92,252,0.4)]"
          />
          <h1
            className={`font-display leading-none text-text-primary ${
              compact ? 'text-5xl' : 'text-6xl md:text-7xl'
            }`}
          >
            Ikoni
            <span className="bg-gradient-to-br from-accent-light via-accent to-accent-dark bg-clip-text text-transparent">
              K
            </span>
          </h1>
          <span className="self-start rounded-full border border-accent/30 bg-accent-surface px-2 py-0.5 font-mono text-[10px] text-accent-light">
            v{version}
          </span>
        </div>

        <p
          className={`mx-auto mt-3 text-sm text-text-secondary ${compact ? '' : 'md:text-base'}`}
        >
          Claude-powered vector graphics studio.
        </p>
      </div>
    </section>
  )
}
