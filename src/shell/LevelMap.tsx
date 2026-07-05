'use client';

import { useRouter } from 'next/navigation';
import { levels } from '@/levels';
import { isUnlocked, useProgress } from './progress';
import type { LevelManifest } from './types';

const ACTS: { title: string; match: (l: LevelManifest) => boolean }[] = [
  { title: 'Act I — Routes & the Server Boundary', match: (l) => l.number <= 5 },
  { title: 'Act II — Data, Caching & Mutations', match: (l) => l.number > 5 && l.number <= 10 },
  { title: 'Act III — Platform & the Capstone', match: (l) => l.number > 10 },
];

function LevelCard({ level, completed }: { level: LevelManifest; completed: Set<string> }) {
  const router = useRouter();
  const unlocked = isUnlocked(level, completed);
  const done = completed.has(level.id);

  return (
    <button
      className={`level-card sev-${level.severity} ${done ? 'complete' : ''} ${unlocked ? '' : 'locked'}`}
      onClick={() => unlocked && router.push(`/level/${level.id}`)}
      disabled={!unlocked}
      title={unlocked ? level.title : 'Fix the previous level to unlock'}
    >
      <div className="top-row">
        <span className="level-num">BUG-{String(level.number).padStart(3, '0')}</span>
        <span className={`level-status ${done ? 'done' : unlocked ? 'open' : 'lock'}`}>
          {done ? '✓ RESOLVED' : unlocked ? 'OPEN' : 'LOCKED'}
        </span>
      </div>
      <span className="name">{level.title}</span>
      <span className="chip">{level.concept}</span>
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
  const statusClass = allDone ? 'state-ok' : completed.size === 0 ? 'state-critical' : 'state-degraded';
  const statusText = allDone
    ? 'ALL SYSTEMS OPERATIONAL'
    : `${completed.size === 0 ? 'CRITICAL' : 'DEGRADED'} — ${openCount} OPEN INCIDENT${openCount === 1 ? '' : 'S'}`;

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Season 2 · Next.js App Router · On-Call Rotation</p>
        <h1>Learn Next.js by fixing it.</h1>
        <p className="tagline">
          Every level teaches one App Router concept — and ships with a real bug, planted in a
          real route. Read the ticket, open the file in your editor, fix the code, and run the
          checks. They hit the actual server. You&apos;re on call again.
        </p>
        <p className="system-status">
          <span className={`status-dot ${statusTone} ${allDone ? '' : 'live'}`} />
          <span className={statusClass}>SYSTEM STATUS: {statusText}</span>
        </p>
        {allDone ? (
          <span className="chip severity-Low">
            Season complete — all {levels.length} incidents resolved
          </span>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => nextLevel && router.push(`/level/${nextLevel.id}`)}
          >
            {completed.size === 0
              ? 'Start Level 01'
              : `Continue → Level ${String(nextLevel?.number ?? 1).padStart(2, '0')}`}
          </button>
        )}
      </section>

      {ACTS.map((act) => {
        const actLevels = levels.filter(act.match);
        if (actLevels.length === 0) return null;
        return (
          <section className="map-section" key={act.title}>
            <h2>{act.title}</h2>
            <div className="level-grid">
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
