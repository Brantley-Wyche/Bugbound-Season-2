export const LEGACY_KEY = 'bugbound:s2:progress:v1';
export const PROGRESS_PREFIX = 'bugbound:s2:progress:v2:';
const GENERATION_KEY = `${PROGRESS_PREFIX}generation`;
const INITIAL_GENERATION = 'initial';

type StorageAccess = Pick<Storage, 'getItem' | 'setItem'>;
export type RunToken = { generation: string; version: number };
type Snapshot = RunToken & {
  completed: ReadonlySet<string> | null;
  saved: ReadonlySet<string>;
  loadError: boolean;
  saveError: boolean;
  resetError: boolean;
};
const SERVER_SNAPSHOT: Snapshot = {
  completed: null,
  saved: new Set(),
  generation: INITIAL_GENERATION,
  version: 0,
  loadError: false,
  saveError: false,
  resetError: false,
};

export function createProgressStore(
  ids: readonly string[],
  getStorage: () => StorageAccess,
) {
  const known = new Set(ids);
  const listeners = new Set<() => void>();
  const pending = new Set<string>();
  let snapshot = SERVER_SNAPSHOT;
  const key = (generation: string, id: string) =>
    `${PROGRESS_PREFIX}done:${generation}:${id}`;
  const publish = (fields: Partial<Snapshot>) => {
    const next = { ...snapshot, ...fields };
    snapshot = { ...next, completed: new Set([...next.saved, ...pending]) };
    listeners.forEach((listener) => listener());
  };
  const generationOf = (storage: StorageAccess) => {
    const value = storage.getItem(GENERATION_KEY) ?? INITIAL_GENERATION;
    if (!/^[a-zA-Z0-9-]{1,100}$/.test(value))
      throw new Error('Invalid progress generation');
    return value;
  };

  function refresh() {
    try {
      const storage = getStorage();
      const generation = generationOf(storage);
      const saved = new Set(
        ids.filter((id) => storage.getItem(key(generation, id)) === '1'),
      );
      const legacy: string[] = [];
      if (generation === INITIAL_GENERATION) {
        const raw = storage.getItem(LEGACY_KEY);
        let value: unknown;
        try {
          value = JSON.parse(raw ?? 'null');
        } catch {
          value = null;
        }
        if (Array.isArray(value)) {
          for (const id of value) {
            if (typeof id === 'string' && known.has(id) && !saved.has(id))
              legacy.push(id);
          }
        }
      }
      if (generationOf(storage) !== generation)
        throw new Error('Progress changed while reading');
      const changed = generation !== snapshot.generation;
      if (changed) pending.clear();
      let migrationFailed = false;
      for (const id of legacy) {
        try {
          storage.setItem(key(generation, id), '1');
          saved.add(id);
        } catch {
          pending.add(id);
          migrationFailed = true;
        }
      }
      for (const id of saved) pending.delete(id);
      publish({
        generation,
        saved,
        version: snapshot.version + Number(changed),
        loadError: false,
        saveError: migrationFailed || pending.size > 0,
        resetError: changed ? false : snapshot.resetError,
      });
      return true;
    } catch {
      publish({ loadError: true });
      return false;
    }
  }

  function persistPending() {
    try {
      const storage = getStorage();
      const generation = snapshot.generation;
      if (generationOf(storage) !== generation) {
        refresh();
        return;
      }
      // Separate additive keys avoid read/modify/write races between tabs.
      for (const id of pending) storage.setItem(key(generation, id), '1');
      refresh();
    } catch {
      publish({ saveError: true });
    }
  }

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => SERVER_SNAPSHOT,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) refresh();
      return () => {
        listeners.delete(listener);
      };
    },
    refresh,
    captureRun(): RunToken {
      refresh();
      return { generation: snapshot.generation, version: snapshot.version };
    },
    markComplete(id: string, token: RunToken) {
      const current = () =>
        token.generation === snapshot.generation &&
        token.version === snapshot.version;
      if (!known.has(id) || !current()) return;
      const readable = refresh();
      if (!current() || snapshot.saved.has(id)) return;
      pending.add(id);
      if (readable) persistPending();
      else publish({ saveError: true });
    },
    retrySave() {
      if (refresh()) persistPending();
    },
    reset() {
      publish({ version: snapshot.version + 1 });
      try {
        const generation = crypto.randomUUID();
        getStorage().setItem(GENERATION_KEY, generation);
        pending.clear();
        publish({
          generation,
          saved: new Set(),
          loadError: false,
          saveError: false,
          resetError: false,
        });
        refresh();
      } catch {
        publish({ resetError: true });
      }
    },
  };
}
