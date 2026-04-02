'use client'

import Link from 'next/link'

export default function DesignPage() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6">
      <div className="glass rounded-2xl p-12 max-w-lg text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-accent-surface border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-accent"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="font-display text-4xl text-text-primary mb-3">
          Design Mode
        </h1>
        <p className="text-text-secondary mb-2">
          Create original icons from text prompts with Claude AI.
        </p>
        <p className="text-text-tertiary text-sm mb-8">
          This feature is currently in development and will be available in a future update.
        </p>
        <Link
          href="/convert"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dark text-white rounded-lg transition-colors font-medium"
        >
          Go to Convert Mode
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
