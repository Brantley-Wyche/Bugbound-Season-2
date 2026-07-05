'use client';

import { use } from 'react';
import Link from 'next/link';
import { levels } from '@/levels';
import { isUnlocked, useProgress } from '@/shell/progress';
import LevelPage from '@/shell/LevelPage';
import { Button } from '@/components/ui/button';

export default function LevelRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { completed: loaded, markComplete } = useProgress();
  const level = levels.find((l) => l.id === id);

  if (!level) {
    return (
      <main className="space-y-4 pt-10">
        <p className="text-muted-foreground">
          No incident with that id — it may have been renumbered.
        </p>
        <Button variant="outline" asChild className="font-mono text-xs uppercase tracking-[0.07em]">
          <Link href="/">← Back to the map</Link>
        </Button>
      </main>
    );
  }

  // Progress not loaded yet — render nothing gate-dependent to avoid a flash.
  if (loaded === null) return <main />;

  if (!isUnlocked(level, loaded)) {
    return (
      <main className="space-y-4 pt-10">
        <p className="text-muted-foreground">
          This incident is still locked — resolve the previous one first.
        </p>
        <Button variant="outline" asChild className="font-mono text-xs uppercase tracking-[0.07em]">
          <Link href="/">← Back to the map</Link>
        </Button>
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
