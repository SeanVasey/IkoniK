import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-void">
      <Header />
      <main className="flex-1 pt-14">{children}</main>
      <Footer />
    </div>
  )
}
