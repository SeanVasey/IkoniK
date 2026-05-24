'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-error">
        Error
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-text-primary sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-text-secondary">
        An unexpected error occurred. The team has been notified.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-text-tertiary">
          Reference: {error.digest}
        </p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
      >
        Try again
      </button>
    </main>
  )
}
