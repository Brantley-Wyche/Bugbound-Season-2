'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { levels } from '@/levels';
import { useProgress } from '@/shell/progress/ProgressProvider';
import { isUnlocked } from '@/levels/progression';
import LoadedLevel from '@/shell/lesson/LoadedLevel';
import { Button } from '@/components/ui/button';

export default function LevelRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { completed: loaded, saved, markComplete, version } = useProgress();
  const level = levels.find((l) => l.id === id);

  if (!level) {
    return (
      <main id="main-content" tabIndex={-1} className="route-message">
        <h1 className="text-2xl font-semibold">Incident not found</h1>
        <p className="text-muted-foreground">
          No incident with that id — it may have been renumbered.
        </p>
        <Button variant="outline" render={<Link href="/" />}>
          <ArrowLeft aria-hidden="true" /> Incident register
        </Button>
      </main>
    );
  }

  // Progress not loaded yet — render nothing gate-dependent to avoid a flash.
  if (loaded === null)
    return (
      <main id="main-content" tabIndex={-1} className="route-message">
        <p role="status">Loading progress…</p>
      </main>
    );

  if (!isUnlocked(level, loaded)) {
    const previous = levels.find((l) => l.number === level.number - 1);
    return (
      <main id="main-content" tabIndex={-1} className="route-message">
        <h1 className="text-2xl font-semibold">Incident locked</h1>
        <p className="text-muted-foreground">
          {previous
            ? `Close ${String(previous.number).padStart(2, '0')} ${previous.title} to open this incident.`
            : 'This incident is still locked.'}
        </p>
        <Button variant="outline" render={<Link href="/" />}>
          <ArrowLeft aria-hidden="true" /> Incident register
        </Button>
      </main>
    );
  }

  return (
    <LoadedLevel
      key={`${level.id}:${version}`}
      id={level.id}
      isComplete={loaded.has(level.id)}
      isSaved={saved.has(level.id)}
      onComplete={(token, info) => markComplete(level.id, token, info)}
    />
  );
}
