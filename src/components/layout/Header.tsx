'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAppStore } from '@/stores/useAppStore'
import { ModelSelector } from '@/components/controls/ModelSelector'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  href: string
  label: string
  enabled: boolean
  badge?: string
}

const navItems: NavItem[] = [
  { href: '/convert', label: 'Convert', enabled: true },
  { href: '/design', label: 'Design', enabled: false, badge: 'Coming Soon' },
]

export { Header }
export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, toggleSidebar } = useAppStore()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <header className="glass fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 md:px-6">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="md:hidden flex flex-col justify-center gap-1 p-1"
          aria-label="Toggle menu"
        >
          <span className="block h-0.5 w-5 bg-text-secondary" />
          <span className="block h-0.5 w-5 bg-text-secondary" />
          <span className="block h-0.5 w-5 bg-text-secondary" />
        </button>

        <span className="text-xs font-medium uppercase tracking-widest text-text-tertiary hidden sm:inline">
          VASEY/AI
        </span>
        <span className="hidden sm:inline text-border-subtle">|</span>
        <span className="font-display text-2xl leading-none tracking-wide text-text-primary">
          Ikoni<span className="text-accent">K</span>
        </span>
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

      {/* Right: Model selector + user */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <ModelSelector compact />
        </div>

        {user && (
          <div className="relative group">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent uppercase"
              aria-label="User menu"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name ?? 'User avatar'}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                user.name?.charAt(0) ?? user.email.charAt(0)
              )}
            </button>
            <div className="invisible group-hover:visible absolute right-0 top-full mt-1 glass rounded-lg py-1 min-w-[140px] shadow-xl">
              <span className="block px-3 py-1.5 text-xs text-text-secondary truncate">
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
