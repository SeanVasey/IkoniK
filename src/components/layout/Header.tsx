'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAppStore } from '@/stores/useAppStore'
import { ModelSelector } from '@/components/controls/ModelSelector'
import { NavDrawer } from '@/components/layout/NavDrawer'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  href: string
  label: string
  enabled: boolean
  badge?: string
}

const navItems: NavItem[] = [
  { href: '/studio', label: 'Studio', enabled: true },
  { href: '/design', label: 'Design', enabled: false, badge: 'Coming Soon' },
]

export { Header }
export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { toggleSidebar } = useAppStore()
  const [email, setEmail] = useState<string | null>(null)

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

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <header className="glass fixed top-0 left-0 right-0 z-50 h-safe-header flex items-center justify-between px-safe-4 md:px-safe-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger — opens the NavDrawer */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="md:hidden -ml-2 flex h-11 w-11 flex-col items-center justify-center gap-1 rounded-lg transition-colors hover:bg-white/5 active:bg-white/10"
            aria-label="Open menu"
          >
            <span className="block h-0.5 w-5 bg-text-secondary" />
            <span className="block h-0.5 w-5 bg-text-secondary" />
            <span className="block h-0.5 w-5 bg-text-secondary" />
          </button>

          <span className="text-xs font-medium uppercase tracking-widest text-text-tertiary hidden sm:inline">
            VASEY/AI
          </span>
          <span className="hidden sm:inline text-border-subtle">|</span>
          <Link
            href="/"
            className="font-display text-2xl leading-none tracking-wide text-text-primary"
          >
            Ikoni<span className="text-accent">K</span>
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.enabled ? item.href : '#'}
                className={`
                  relative px-4 py-2 text-sm font-medium transition-colors rounded-md
                  ${item.enabled ? 'hover:text-text-primary' : 'pointer-events-none'}
                  ${isActive && item.enabled ? 'text-text-primary' : 'text-text-secondary'}
                  ${!item.enabled ? 'opacity-40' : ''}
                `}
                aria-disabled={!item.enabled}
                tabIndex={item.enabled ? 0 : -1}
              >
                <span className="flex items-center gap-1.5">
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] font-normal text-text-tertiary bg-pewter px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </span>
                {isActive && item.enabled && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-accent rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: Model selector + sign out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ModelSelector compact />
          </div>

          {email && (
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline max-w-[180px] truncate font-mono text-xs text-text-tertiary">
                {email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-secondary transition-colors hover:border-text-tertiary hover:text-text-primary active:bg-white/10"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <NavDrawer />
    </>
  )
}
