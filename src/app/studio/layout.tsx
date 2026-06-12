'use client'

import { MotionConfig } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // reducedMotion="user" makes every framer-motion animation in the studio
    // respect prefers-reduced-motion
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 px-safe-4 pt-safe-header-loose pb-6 md:px-safe-6">
          {children}
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
