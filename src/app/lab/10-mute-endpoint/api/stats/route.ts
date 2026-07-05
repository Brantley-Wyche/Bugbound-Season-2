import { NextResponse } from 'next/server';
import { getStats } from '../../store';

export async function get() {
  return NextResponse.json(getStats());
}
