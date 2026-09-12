'use client';

import { useEffect, useState } from 'react';
import { loaders } from '@/levels/generated/loaders';
import { Button } from '@/components/ui/button';
import LevelPage from './LevelPage';
import type { LevelManifest } from '../types';
import type { RunToken } from '../progress/progress-store';

export default function LoadedLevel({
  id,
  isComplete,
  isSaved,
  onComplete,
}: {
  id: string;
  isComplete: boolean;
  isSaved: boolean;
  onComplete: (token: RunToken) => void;
}) {
  const [level, setLevel] = useState<LevelManifest | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const loader = Object.hasOwn(loaders, id) ? loaders[id] : undefined;
    Promise.resolve()
      .then(() => {
        if (!loader) throw new Error('Incident module missing');
        return loader();
      })
      .then(
        (module) => {
          if (active) setLevel(module.default);
        },
        () => {
          if (active) setError(true);
        },
      );
    return () => {
      active = false;
    };
  }, [id, attempt]);

  if (!level)
    return (
      <main id="main-content" tabIndex={-1} className="route-message">
        <p role="status">
          {error
            ? 'The incident could not load. Check the dev server and retry.'
            : 'Loading incident...'}
        </p>
        {error && (
          <Button
            variant="outline"
            onClick={() => {
              setError(false);
              setAttempt((value) => value + 1);
            }}
          >
            Retry incident
          </Button>
        )}
      </main>
    );
  return (
    <LevelPage
      level={level}
      isComplete={isComplete}
      isSaved={isSaved}
      onComplete={onComplete}
    />
  );
}
