import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/** Leaving the beta hands the pass back. */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('beta-pass');
  return NextResponse.json({ ok: true, message: 'Pass returned.' });
}
