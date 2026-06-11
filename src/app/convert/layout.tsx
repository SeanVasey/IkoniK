'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function ConvertLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-safe-4 pt-safe-header-loose pb-6 md:px-safe-6">{children}</main>
      <Footer />
    </div>
  )
}
