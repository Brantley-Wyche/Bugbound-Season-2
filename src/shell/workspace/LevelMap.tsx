'use client';

import Link from 'next/link';
import { ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { levels } from '@/levels';
import { useProgress } from '../progress/ProgressProvider';
import { acts, isUnlocked } from '@/levels/progression';
import { Button } from '@/components/ui/button';

export default function LevelMap() {
  const { completed, saved } = useProgress();
  const next =
    completed &&
    levels.find(
      (level) => !completed.has(level.id) && isUnlocked(level, completed),
    );
  return (
    <main id="main-content" tabIndex={-1} className="incident-register">
      <header className="register-heading">
        <h1>Incident register</h1>
        <p>
          Season 2 / Next.js App Router. Thirteen investigations in real source
          code.
        </p>
      </header>
      {completed === null ? (
        <p role="status">Loading progress...</p>
      ) : next ? (
        <section className="next-incident">
          <div>
            <h2>
              <span>{String(next.number).padStart(2, '0')}</span> {next.title}
            </h2>
            <p>{next.symptom}</p>
          </div>
          <Button render={<Link href={`/level/${next.id}`} />}>
            Open investigation <ArrowRight aria-hidden="true" />
          </Button>
        </section>
      ) : (
        <section className="next-incident">
          <div>
            <h2>Season 2 complete</h2>
            <p>
              All thirteen incidents completed. Revisit any incident to check
              your current source.
            </p>
          </div>
          <Check aria-hidden="true" />
        </section>
      )}
      {acts.map((act, index) => (
        <section className="register-act" key={act.from}>
          <h2>
            <span>Act 0{index + 1}</span>
            {act.name}
          </h2>
          <ol>
            {levels
              .filter(
                (level) => level.number >= act.from && level.number <= act.to,
              )
              .map((level) => {
                const unlocked =
                  completed !== null && isUnlocked(level, completed);
                const done = completed?.has(level.id);
                const content = (
                  <>
                    <span className="register-number">
                      {String(level.number).padStart(2, '0')}
                    </span>
                    <span className="register-title">
                      {level.title}
                      <span>{level.concept}</span>
                    </span>
                    <span className="register-state">
                      {done ? (
                        <>
                          <Check size={15} aria-hidden="true" />
                          {saved.has(level.id) ? 'Saved' : 'This visit'}
                        </>
                      ) : unlocked ? (
                        <>
                          Open
                          <ArrowRight size={15} aria-hidden="true" />
                        </>
                      ) : (
                        <>
                          <LockKeyhole size={13} aria-hidden="true" />
                          Locked
                        </>
                      )}
                    </span>
                  </>
                );
                return (
                  <li key={level.id}>
                    {unlocked ? (
                      <Link href={`/level/${level.id}`}>{content}</Link>
                    ) : (
                      <div aria-disabled="true">{content}</div>
                    )}
                  </li>
                );
              })}
          </ol>
        </section>
      ))}
    </main>
  );
}
