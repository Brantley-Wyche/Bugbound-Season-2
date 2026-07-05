import { NextResponse, type NextRequest } from 'next/server';

/**
 * Gate for the Season 2 lab's beta area: only visitors holding a beta pass
 * cookie may enter; everyone else is sent to the signup page.
 * Scoped strictly to the beta area — it never touches the rest of the app.
 */
export default function proxy(request: NextRequest) {
  const pass = request.cookies.get('beta-pass')?.value;

  if (pass !== '1') {
    return NextResponse.redirect(new URL('/lab/12-the-bouncer/signup', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/lab/12-the-bouncer/beta/:path*',
};
