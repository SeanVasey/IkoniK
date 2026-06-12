import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NavDrawer } from '@/components/layout/NavDrawer'
import { useAppStore } from '@/stores/useAppStore'

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn().mockResolvedValue({}),
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

describe('NavDrawer', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    useAppStore.setState({ sidebarOpen: false })
  })

  it('is hidden until opened, then shows signed-out items', async () => {
    render(<NavDrawer />)
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).toHaveAttribute('aria-hidden', 'true')

    useAppStore.getState().setSidebarOpen(true)
    await waitFor(() =>
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-hidden', 'false')
    )
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('shows Studio, Sign out and the account email when signed in', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'sean@vasey.audio' } },
    })
    useAppStore.setState({ sidebarOpen: true })
    render(<NavDrawer />)

    expect(
      await screen.findByRole('link', { name: 'Studio' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Sign out' })
    ).toBeInTheDocument()
    expect(screen.getByText('sean@vasey.audio')).toBeInTheDocument()
  })

  it('closes on Escape and restores body scroll', async () => {
    useAppStore.setState({ sidebarOpen: true })
    render(<NavDrawer />)

    await waitFor(() => expect(document.body.style.overflow).toBe('hidden'))

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(useAppStore.getState().sidebarOpen).toBe(false)
    await waitFor(() => expect(document.body.style.overflow).toBe(''))
  })
})
