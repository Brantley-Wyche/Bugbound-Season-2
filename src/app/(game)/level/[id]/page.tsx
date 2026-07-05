'use client';

import { use } from 'react';
import Link from 'next/link';
import { levels } from '@/levels';
import { isUnlocked, useProgress } from '@/shell/progress';
import LevelPage from '@/shell/LevelPage';

export default function LevelRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { completed: loaded, markComplete } = useProgress();
  const level = levels.find((l) => l.id === id);

  if (!level) {
    return (
      <main>
        <p className="checks-idle">No incident with that id — it may have been renumbered.</p>
        <p>
          <Link className="btn" href="/">
            ← Back to the map
          </Link>
        </p>
      </main>
    );
  }

  // Progress not loaded yet — render nothing gate-dependent to avoid a flash.
  if (loaded === null) return <main />;

  if (!isUnlocked(level, loaded)) {
    return (
      <main>
        <p className="checks-idle">
          This incident is still locked — resolve the previous one first.
        </p>
        <p>
          <Link className="btn" href="/">
            ← Back to the map
          </Link>
        </p>
      </main>
    );
  }

  return (
    <LevelPage
      level={level}
      isComplete={loaded.has(level.id)}
      onComplete={() => markComplete(level.id)}
    />
  );
}
