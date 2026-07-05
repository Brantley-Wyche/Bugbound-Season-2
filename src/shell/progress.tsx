'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { levels } from '@/levels';
import type { LevelManifest } from './types';

const KEY = 'bugbound:s2:progress:v1';

function load(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

interface ProgressState {
  /** null until localStorage has been read on the client. */
  completed: Set<string> | null;
  markComplete: (id: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressState>({
  completed: null,
  markComplete: () => {},
  resetProgress: () => {},
});

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  // Starts null on both server and first client render (no hydration
  // mismatch in the shell, ever), then fills in from localStorage.
  const [completed, setCompleted] = useState<Set<string> | null>(null);

  useEffect(() => {
    setCompleted(load());
  }, []);

  const markComplete = (id: string) => {
    setCompleted((prev) => {
      const base = prev ?? new Set<string>();
      if (base.has(id)) return prev;
      const next = new Set(base);
      next.add(id);
      localStorage.setItem(KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const resetProgress = () => {
    localStorage.removeItem(KEY);
    setCompleted(new Set());
  };

  return (
    <ProgressContext.Provider value={{ completed, markComplete, resetProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}

export function isUnlocked(level: LevelManifest, completed: Set<string>) {
  if (level.number === 1) return true;
  const previous = levels.find((l) => l.number === level.number - 1);
  return previous ? completed.has(previous.id) : false;
}
