import { resetLaunchStore } from '@/app/lab/13-launch-day/store';
import { validateFixtureReset } from '@/shell/checks/fixture-reset';

export async function POST(request: Request) {
  const rejection = validateFixtureReset(request, process.env.NODE_ENV);
  if (rejection) return Response.json({ error: 'Lab reset is available only from this local development app.' }, { status: rejection });
  const body = await request.json().catch(() => null);
  if (body?.levelId !== '13-launch-day') {
    return Response.json({ error: 'Unknown lab fixture.' }, { status: 400 });
  }
  resetLaunchStore();
  return Response.json({ reset: true }, { headers: { 'Cache-Control': 'no-store' } });
}
