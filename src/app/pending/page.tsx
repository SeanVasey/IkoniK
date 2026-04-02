'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PendingPage() {
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
        {/* Hourglass icon */}
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
            <path d="M6 2h12M6 22h12M7 2v4a5 5 0 0 0 5 5 5 5 0 0 0 5-5V2M7 22v-4a5 5 0 0 1 5-5 5 5 0 0 1 5 5v4" />
            <circle cx="12" cy="12" r="0.5" fill="#7C5CFC" />
          </svg>
        </div>

        <h1
          className="mb-3 text-2xl font-bold"
          style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#F0F2F5', letterSpacing: '0.02em' }}
        >
          Account Pending Approval
        </h1>

        <p className="mb-8 text-sm leading-relaxed" style={{ color: '#8A94A0' }}>
          Your account has been created and is awaiting administrator approval. You will be able to
          access IkoniK once your account has been approved.
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
