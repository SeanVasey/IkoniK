'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Provider } from '@supabase/supabase-js';

const providers: { name: string; id: Provider; icon: React.ReactNode }[] = [
  {
    name: 'Google',
    id: 'google',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    id: 'github',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    name: 'Microsoft',
    id: 'azure',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M2 2h9.5v9.5H2V2zm10.5 0H22v9.5h-9.5V2zM2 12.5h9.5V22H2v-9.5zm10.5 0H22V22h-9.5v-9.5z" />
      </svg>
    ),
  },
];

export default function LoginPage() {
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (provider: Provider) => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });

    if (error) {
      setError(error.message || 'That provider isn’t enabled yet. Try another one.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-void px-safe-4">
      {/* Accent glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(124,92,252,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="glass relative z-10 w-full max-w-md rounded-2xl px-6 py-12 text-center sm:px-8">
        {/* App icon — brand mark for the VASEY/AI series splash */}
        <div className="mb-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-ios.svg"
            alt="IkoniK app icon"
            width={104}
            height={104}
            className="drop-shadow-[0_0_32px_rgba(124,92,252,0.45)]"
            style={{ height: 104, width: 104 }}
          />
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-accent-light/80">
          VASEY/AI PRESENTS
        </p>

        <h1 className="mb-2 font-display text-6xl font-bold leading-none text-text-primary">
          Ikoni
          <span className="bg-gradient-to-br from-accent-light via-accent to-accent-dark bg-clip-text text-transparent">
            K
          </span>
        </h1>

        <p className="mb-10 text-sm text-text-secondary">
          Claude-powered vector graphics studio.
        </p>

        <div className="space-y-3">
          {providers.map(({ name, id, icon }) => (
            <button
              key={id}
              onClick={() => handleSignIn(id)}
              className="glass flex min-h-[52px] w-full items-center justify-center gap-3 rounded-lg px-4 text-sm font-medium text-text-primary transition-colors hover:bg-white/5 active:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              {icon}
              Continue with {name}
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-error">
            {error}
          </p>
        )}

        <p className="mt-8 text-xs text-text-tertiary">
          New accounts require administrator approval before entering the studio.
        </p>

        <Link
          href="/"
          className="mt-4 inline-flex min-h-[44px] items-center text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
