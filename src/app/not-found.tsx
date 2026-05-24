import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-tertiary">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-text-primary sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
      >
        Back to IkoniK
      </Link>
    </main>
  )
}
