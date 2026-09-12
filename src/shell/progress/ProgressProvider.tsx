'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { levels } from '@/levels';
import {
  createProgressStore,
  LEGACY_KEY,
  PROGRESS_PREFIX,
} from './progress-store';

const ProgressContext = createContext<ReturnType<
  typeof createProgressStore
> | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() =>
    createProgressStore(
      levels.map((level) => level.id),
      () => window.localStorage,
    ),
  );
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === LEGACY_KEY ||
        event.key.startsWith(PROGRESS_PREFIX)
      )
        store.refresh();
    };
    const refresh = () => {
      store.refresh();
    };
    window.addEventListener('storage', sync);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', refresh);
    };
  }, [store]);

  return (
    <ProgressContext.Provider value={store}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const store = useContext(ProgressContext);
  if (!store) throw new Error('ProgressProvider is required');
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return {
    ...snapshot,
    captureRun: store.captureRun,
    markComplete: store.markComplete,
    resetProgress: store.reset,
    retrySave: store.retrySave,
    retryLoad: store.refresh,
  };
}
