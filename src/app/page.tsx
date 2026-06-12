import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Hero } from '@/components/layout/Hero'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GlassCard } from '@/components/shared/GlassCard'

const features = [
  {
    title: 'Hybrid tracing engines',
    body: 'Potrace, VTracer and ImageTracerJS under one roof — the right engine is picked per image, not one-size-fits-all.',
  },
  {
    title: 'Claude-powered analysis',
    body: 'Claude inspects your image first and plans the conversion: engine, strategy, preprocessing and expected fidelity.',
  },
  {
    title: 'Production-ready SVG export',
    body: 'Optimized, layered SVG output with PSNR/SSIM fidelity metrics — download as SVG or rasterize back to PNG.',
  },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-safe-4 pt-safe-header md:px-safe-6">
        <div className="mx-auto max-w-3xl">
          <Hero />

          <p className="mx-auto max-w-xl text-center text-base leading-relaxed text-text-secondary">
            IkoniK turns raster images into clean, production-ready vector
            graphics. Claude analyzes each image, picks the best tracing
            strategy, and delivers an SVG you can ship.
          </p>

          {/* Primary CTA — never auto-redirects; entering the studio is always explicit */}
          <div className="mt-8 flex justify-center">
            {user ? (
              <Link
                href="/studio"
                className="flex min-h-[52px] w-full max-w-xs items-center justify-center rounded-lg bg-accent px-8 text-base font-medium text-white transition-colors hover:bg-accent-dark active:bg-accent-dark sm:w-auto"
              >
                Enter Studio
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex min-h-[52px] w-full max-w-xs items-center justify-center rounded-lg bg-accent px-8 text-base font-medium text-white transition-colors hover:bg-accent-dark active:bg-accent-dark sm:w-auto"
              >
                Sign in to start
              </Link>
            )}
          </div>

          {/* Feature highlights */}
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <GlassCard key={feature.title} className="p-5">
                <h2 className="font-display text-xl tracking-wide text-text-primary">
                  {feature.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {feature.body}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
