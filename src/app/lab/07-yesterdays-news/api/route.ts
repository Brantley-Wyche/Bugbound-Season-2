import { NextResponse } from 'next/server';
import { addHeadline, getHeadlines } from '../store';

export async function GET() {
  return NextResponse.json({ headlines: getHeadlines() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text) {
    return NextResponse.json({ error: 'A headline needs text.' }, { status: 400 });
  }
  const headline = addHeadline(text);
  return NextResponse.json({ headline }, { status: 201 });
}
