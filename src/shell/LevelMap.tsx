'use client';

import { useRouter } from 'next/navigation';
import { levels } from '@/levels';
import { isUnlocked, useProgress } from './progress';
import type { LevelManifest, Severity } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const ACTS: { title: string; match: (l: LevelManifest) => boolean }[] = [
  { title: 'Act I — Routes & the Server Boundary', match: (l) => l.number <= 5 },
  { title: 'Act II — Data, Caching & Mutations', match: (l) => l.number > 5 && l.number <= 10 },
  { title: 'Act III — Platform & the Capstone', match: (l) => l.number > 10 },
];

const SEVERITY_STRIPE: Record<Severity, string> = {
  Low: 'border-l-border-strong',
  Medium: 'border-l-warn',
  High: 'border-l-sev-high',
  Critical: 'border-l-err',
};

function LevelCard({ level, completed }: { level: LevelManifest; completed: Set<string> }) {
  const router = useRouter();
  const unlocked = isUnlocked(level, completed);
  const done = completed.has(level.id);

  return (
    <button
      className={cn(
        'group flex flex-col gap-2 rounded-md border bg-card p-4 text-left transition-colors',
        'border-l-[3px]',
        SEVERITY_STRIPE[level.severity],
        unlocked ? 'cursor-pointer hover:border-border-strong hover:bg-panel-2' : 'cursor-not-allowed opacity-45 border-l-border',
        done && 'border-ok/40',
      )}
      onClick={() => unlocked && router.push(`/level/${level.id}`)}
      disabled={!unlocked}
      title={unlocked ? level.title : 'Fix the previous level to unlock'}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11.5px] tracking-[0.1em] text-muted-foreground">
          BUG-{String(level.number).padStart(3, '0')}
        </span>
        <span
          className={cn(
            'font-mono text-[10.5px] font-semibold tracking-[0.1em]',
            done ? 'text-ok' : unlocked ? 'text-warn' : 'text-faint',
          )}
        >
          {done ? '✓ RESOLVED' : unlocked ? 'OPEN' : 'LOCKED'}
        </span>
      </div>
      <span className="font-semibold leading-snug tracking-[-0.01em]">{level.title}</span>
      <Badge
        variant="outline"
        className="border-info/30 bg-info/10 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-info"
      >
        {level.concept}
      </Badge>
    </button>
  );
}

export default function LevelMap() {
  const router = useRouter();
  const { completed: loaded } = useProgress();
  const completed = loaded ?? new Set<string>();
  const nextLevel = levels.find((l) => !completed.has(l.id) && isUnlocked(l, completed));
  const allDone = completed.size === levels.length;

  const openCount = levels.length - completed.size;
  const statusTone = allDone ? 'ok' : completed.size === 0 ? 'err' : 'warn';
  const statusColor = allDone ? 'text-ok' : completed.size === 0 ? 'text-err' : 'text-warn';
  const statusText = allDone
    ? 'ALL SYSTEMS OPERATIONAL'
    : `${completed.size === 0 ? 'CRITICAL' : 'DEGRADED'} — ${openCount} OPEN INCIDENT${openCount === 1 ? '' : 'S'}`;

  return (
    <main>
      <section className="pb-10 pt-9">
        <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Season 2 · Next.js App Router · On-Call Rotation
        </p>
        <h1 className="mb-3 text-[42px] font-semibold leading-[1.1] tracking-[-0.02em]">
          Learn Next.js by fixing it.
        </h1>
        <p className="mb-5 max-w-[640px] text-[16.5px] text-muted-foreground">
          Every level teaches one App Router concept — and ships with a real bug, planted in a
          real route. Read the ticket, open the file in your editor, fix the code, and run the
          checks. They hit the actual server. You&apos;re on call again.
        </p>
        <p className={cn('mb-6 flex items-center gap-2.5 font-mono text-[12.5px] tracking-[0.08em]', statusColor)}>
          <span className={`status-dot ${statusTone} ${allDone ? '' : 'live'}`} />
          <span>SYSTEM STATUS: {statusText}</span>
        </p>
        {allDone ? (
          <Badge
            variant="outline"
            className="border-ok/40 bg-ok/10 font-mono text-xs uppercase tracking-[0.06em] text-ok"
          >
            Season complete — all {levels.length} incidents resolved
          </Badge>
        ) : (
          <Button
            size="lg"
            className="font-mono text-xs font-semibold uppercase tracking-[0.08em]"
            onClick={() => nextLevel && router.push(`/level/${nextLevel.id}`)}
          >
            {completed.size === 0
              ? 'Start Level 01'
              : `Continue → Level ${String(nextLevel?.number ?? 1).padStart(2, '0')}`}
          </Button>
        )}
      </section>

      {ACTS.map((act) => {
        const actLevels = levels.filter(act.match);
        if (actLevels.length === 0) return null;
        return (
          <section className="mb-9" key={act.title}>
            <h2 className="mb-3.5 flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="whitespace-nowrap">{act.title}</span>
              <Separator className="flex-1" />
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
              {actLevels.map((level) => (
                <LevelCard key={level.id} level={level} completed={completed} />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
