import { NextResponse } from 'next/server';
import { addFeedback } from '../../store';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const kind = body?.kind;
  if (kind !== 'praise' && kind !== 'gripe') {
    return NextResponse.json({ error: 'kind must be "praise" or "gripe"' }, { status: 400 });
  }
  return NextResponse.json(addFeedback(kind), { status: 201 });
}
