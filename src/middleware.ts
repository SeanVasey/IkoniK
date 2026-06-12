import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

// '/' is matched exactly; everything else also covers nested paths.
// '/auth' (sans callback) is a public stub that redirects to /login.
const PUBLIC_PATHS = ['/login', '/auth', '/pending', '/suspended'];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const { pathname } = request.nextUrl;

  // Allow public paths through without auth checks. The landing page never
  // redirects on its own — entering the studio is always an explicit action.
  if (
    pathname === '/' ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'))
  ) {
    return response;
  }

  // Validate the session server-side — an expired or absent session never
  // reaches /studio or the API routes.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)'],
};
