import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={`backdrop-blur-[16px] bg-[rgba(20,26,34,0.7)] border border-[rgba(255,255,255,0.08)] rounded-xl ${className}`}
    >
      {children}
    </div>
  )
}
