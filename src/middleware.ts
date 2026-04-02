import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

const PUBLIC_PATHS = ['/auth', '/auth/callback', '/pending', '/suspended'];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const { pathname } = request.nextUrl;

  // Allow public paths through without auth checks
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
    return response;
  }

  // Check for an active session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth';
    return NextResponse.redirect(redirectUrl);
  }

  // Fetch profile status to enforce approval workflow
  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single();

  if (profile?.status === 'pending') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/pending';
    return NextResponse.redirect(redirectUrl);
  }

  if (profile?.status === 'suspended') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/suspended';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons).*)'],
};
