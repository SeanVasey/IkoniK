'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface UserWithUsage extends Profile {
  total_conversions: number
  total_api_calls: number
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserWithUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  const fetchUsers = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      setError('Access denied. Admin privileges required.')
      setLoading(false)
      return
    }

    setIsAdmin(true)

    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const usersWithUsage: UserWithUsage[] = (profiles || []).map((p: Profile) => ({
      ...p,
      total_conversions: 0,
      total_api_calls: 0,
    }))

    setUsers(usersWithUsage)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function updateUserStatus(userId: string, status: 'approved' | 'suspended' | 'pending') {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, status } : u))
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    )
  }

  if (error || !isAdmin) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-6">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5C45" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <h1 className="font-display text-2xl text-text-primary mb-2">Access Denied</h1>
          <p className="text-text-secondary">{error || 'You do not have permission to view this page.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-text-primary mb-2">Admin Panel</h1>
          <p className="text-text-secondary">Manage users and monitor usage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Users" value={users.length} />
          <StatCard
            label="Approved"
            value={users.filter(u => u.status === 'approved').length}
            color="text-success"
          />
          <StatCard
            label="Pending"
            value={users.filter(u => u.status === 'pending').length}
            color="text-warning"
          />
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)]">
                  <th className="text-left px-6 py-4 text-text-secondary text-sm font-medium">User</th>
                  <th className="text-left px-6 py-4 text-text-secondary text-sm font-medium">Provider</th>
                  <th className="text-left px-6 py-4 text-text-secondary text-sm font-medium">Status</th>
                  <th className="text-left px-6 py-4 text-text-secondary text-sm font-medium">Joined</th>
                  <th className="text-right px-6 py-4 text-text-secondary text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr
                    key={user.id}
                    className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-medium">
                            {(user.display_name || user.email || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-text-primary text-sm font-medium">
                            {user.display_name || 'No name'}
                          </div>
                          <div className="text-text-tertiary text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-secondary text-sm capitalize">{user.provider}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-text-tertiary text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status !== 'approved' && (
                          <button
                            onClick={() => updateUserStatus(user.id, 'approved')}
                            className="px-3 py-1.5 text-xs font-medium bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {user.status !== 'suspended' && (
                          <button
                            onClick={() => updateUserStatus(user.id, 'suspended')}
                            className="px-3 py-1.5 text-xs font-medium bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                        {user.status !== 'pending' && (
                          <button
                            onClick={() => updateUserStatus(user.id, 'pending')}
                            className="px-3 py-1.5 text-xs font-medium bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors"
                          >
                            Set Pending
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="glass rounded-xl p-6">
      <div className="text-text-secondary text-sm mb-1">{label}</div>
      <div className={`text-3xl font-display ${color || 'text-text-primary'}`}>{value}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    suspended: 'bg-error/10 text-error',
  }

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-pewter text-text-secondary'}`}>
      {status}
    </span>
  )
}
