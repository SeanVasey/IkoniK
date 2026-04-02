import type { Metadata, Viewport } from 'next'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'IkoniK — Claude-Powered Vector Graphics Studio',
  description:
    'Transform raster images into production-ready SVG vector graphics using Claude AI. Powered by VASEY/AI.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IkoniK',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A0E14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-void">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="font-body bg-void text-text-primary min-h-screen antialiased">
        <div className="flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  )
}
