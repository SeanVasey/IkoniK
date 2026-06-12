'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/stores/useAppStore'
import { createClient } from '@/lib/supabase/client'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Slide-in navigation drawer opened by the header hamburger.
 * Glass panel with focus trap, Esc/backdrop close, body scroll lock and
 * auth-aware menu items (Supabase session checked client-side).
 */
export function NavDrawer() {
  const router = useRouter()
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  const [email, setEmail] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  // Track the Supabase session so menu items reflect auth state
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const close = useCallback(() => setSidebarOpen(false), [setSidebarOpen])

  // Body scroll lock + focus management while open
  useEffect(() => {
    if (!sidebarOpen) return

    previousFocus.current = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Move focus into the panel
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
    focusables?.[0]?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab') return

      // Focus trap: cycle within the panel
      const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!items || items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      previousFocus.current?.focus()
    }
  }, [sidebarOpen, close])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    close()
    router.push('/')
    router.refresh()
  }

  const itemClass =
    'flex min-h-[52px] w-full items-center rounded-lg px-4 text-base text-text-primary transition-colors hover:bg-white/5 active:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent'

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={close}
        className={`fixed inset-0 z-[60] bg-void/60 backdrop-blur-sm transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!sidebarOpen}
        className={`glass fixed inset-y-0 left-0 z-[70] flex w-72 max-w-[85vw] flex-col pt-safe-header duration-200 [transition-property:transform,visibility] ${
          sidebarOpen
            ? 'visible translate-x-0'
            : 'invisible -translate-x-full' /* visibility removes the closed panel from the tab order */
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-display text-xl tracking-wide text-text-primary">
            Ikoni<span className="text-accent">K</span>
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary active:bg-white/10"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Main">
          <Link href="/" onClick={close} className={itemClass}>
            Home
          </Link>
          {email ? (
            <>
              <Link href="/studio" onClick={close} className={itemClass}>
                Studio
              </Link>
              <button type="button" onClick={handleSignOut} className={itemClass}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={close} className={itemClass}>
              Sign in
            </Link>
          )}
        </nav>

        {email && (
          <div className="border-t border-border-subtle px-4 py-4">
            <span className="block truncate font-mono text-xs text-text-tertiary">
              {email}
            </span>
          </div>
        )}
      </div>
    </>
  )
}
