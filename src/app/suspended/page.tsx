'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SuspendedPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0A0E14]">
      {/* Accent glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(124,92,252,0.15) 0%, transparent 70%)',
        }}
      />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl border px-8 py-12 text-center backdrop-blur-xl"
        style={{
          backgroundColor: 'rgba(20, 26, 34, 0.7)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Shield/lock icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#7C5CFC]/10">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill="none"
            stroke="#7C5CFC"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l8 4v6c0 5.25-3.5 8.75-8 10-4.5-1.25-8-4.75-8-10V6l8-4z" />
            <rect x="10" y="10" width="4" height="5" rx="0.5" />
            <path d="M10 10v-1a2 2 0 1 1 4 0v1" />
          </svg>
        </div>

        <h1
          className="mb-3 text-2xl font-bold"
          style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#F0F2F5', letterSpacing: '0.02em' }}
        >
          Account Suspended
        </h1>

        <p className="mb-8 text-sm leading-relaxed" style={{ color: '#8A94A0' }}>
          Your account has been suspended. Please contact an administrator for more information.
        </p>

        <button
          onClick={handleSignOut}
          className="rounded-lg border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.08)',
            color: '#F0F2F5',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
