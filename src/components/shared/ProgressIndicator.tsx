'use client'

import { motion } from 'framer-motion'

interface ProgressIndicatorProps {
  label?: string
  progress?: number
}

export function ProgressIndicator({ label, progress }: ProgressIndicatorProps) {
  const isDeterminate = progress !== undefined

  return (
    <div className="w-full space-y-2">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-pewter">
        {isDeterminate ? (
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        ) : (
          <motion.div
            className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-accent"
            animate={{
              x: ['-100%', '400%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {label && (
        <p className="text-sm text-text-secondary">{label}</p>
      )}
    </div>
  )
}
