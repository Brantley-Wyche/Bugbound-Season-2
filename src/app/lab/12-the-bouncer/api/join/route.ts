import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/** Joining the beta issues the pass cookie the door checks for. */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set('beta-pass', 'true', { path: '/', maxAge: 60 * 60 * 24 });
  return NextResponse.json({ ok: true, message: 'Welcome to the beta.' });
}
