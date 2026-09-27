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
import { createCaseLog, LOG_PREFIX } from './case-log';

type Stores = {
  progress: ReturnType<typeof createProgressStore>;
  caseLog: ReturnType<typeof createCaseLog>;
};
const ProgressContext = createContext<Stores | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [stores] = useState<Stores>(() => {
    const ids = levels.map((level) => level.id);
    return {
      progress: createProgressStore(ids, () => window.localStorage),
      caseLog: createCaseLog(ids, () => window.localStorage),
    };
  });
  useEffect(() => {
    const { progress, caseLog } = stores;
    const sync = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === LEGACY_KEY ||
        event.key.startsWith(PROGRESS_PREFIX)
      )
        progress.refresh();
      if (event.key === null || event.key.startsWith(LOG_PREFIX))
        caseLog.refresh();
    };
    const refresh = () => {
      progress.refresh();
    };
    window.addEventListener('storage', sync);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', refresh);
    };
  }, [stores]);

  return (
    <ProgressContext.Provider value={stores}>
      {children}
    </ProgressContext.Provider>
  );
}

function useStores() {
  const stores = useContext(ProgressContext);
  if (!stores) throw new Error('ProgressProvider is required');
  return stores;
}

export function useProgress() {
  const { progress: store, caseLog } = useStores();
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return {
    ...snapshot,
    captureRun: store.captureRun,
    markComplete: store.markComplete,
    resetProgress() {
      store.reset();
      // The log is kept through a reset and notes that it happened.
      if (!store.getSnapshot().resetError) caseLog.recordReset();
    },
    retrySave: store.retrySave,
    retryLoad: store.refresh,
  };
}

export function useCaseLog() {
  const { caseLog: store } = useStores();
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return {
    ...snapshot,
    recordOpened: store.recordOpened,
    startRun: store.startRun,
    recordRun: store.recordRun,
    recordHint: store.recordHint,
  };
}
