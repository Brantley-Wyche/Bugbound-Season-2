export const LEGACY_KEY = 'bugbound:s2:progress:v1';
export const PROGRESS_PREFIX = 'bugbound:s2:progress:v2:';
const GENERATION_KEY = `${PROGRESS_PREFIX}generation`;
const INITIAL_GENERATION = 'initial';

type StorageAccess = Pick<Storage, 'getItem' | 'setItem'>;
export type RunToken = { generation: string; version: number };
/** When an incident was closed and on which run of that visit. */
export type ClosedInfo = { at: number; run: number };
type Snapshot = RunToken & {
  completed: ReadonlySet<string> | null;
  saved: ReadonlySet<string>;
  closedInfo: ReadonlyMap<string, ClosedInfo>;
  loadError: boolean;
  saveError: boolean;
  resetError: boolean;
};
const SERVER_SNAPSHOT: Snapshot = {
  completed: null,
  saved: new Set(),
  closedInfo: new Map(),
  generation: INITIAL_GENERATION,
  version: 0,
  loadError: false,
  saveError: false,
  resetError: false,
};

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>) =>
  a.size === b.size && [...a].every((id) => b.has(id));

function sameSnapshot(a: Snapshot, b: Snapshot) {
  if (a.completed === null || b.completed === null) return false;
  return (
    a.generation === b.generation &&
    a.version === b.version &&
    a.loadError === b.loadError &&
    a.saveError === b.saveError &&
    a.resetError === b.resetError &&
    sameSet(a.completed, b.completed) &&
    sameSet(a.saved, b.saved) &&
    a.closedInfo.size === b.closedInfo.size &&
    [...a.closedInfo].every(([id, info]) => {
      const other = b.closedInfo.get(id);
      return other?.at === info.at && other.run === info.run;
    })
  );
}

export function createProgressStore(
  ids: readonly string[],
  getStorage: () => StorageAccess,
) {
  const known = new Set(ids);
  const listeners = new Set<() => void>();
  const pending = new Set<string>();
  // Close records: read from storage for saved closes, and kept in memory for
  // closes made in this tab so an unsaved close still shows when it happened.
  let stored = new Map<string, ClosedInfo>();
  const recorded = new Map<string, ClosedInfo>();
  let snapshot = SERVER_SNAPSHOT;
  const key = (generation: string, id: string) =>
    `${PROGRESS_PREFIX}done:${generation}:${id}`;
  const closedKey = (generation: string, id: string) =>
    `${PROGRESS_PREFIX}closed:${generation}:${id}`;
  const publish = (fields: Partial<Snapshot>) => {
    const next = { ...snapshot, ...fields };
    const completed = new Set([...next.saved, ...pending]);
    const closedInfo = new Map(
      [...stored, ...recorded].filter(([id]) => completed.has(id)),
    );
    const candidate = { ...next, completed, closedInfo };
    // A refresh that finds nothing new (the learner returning from the editor)
    // keeps the same snapshot, so subscribers do not re-render.
    if (sameSnapshot(snapshot, candidate)) return;
    snapshot = candidate;
    listeners.forEach((listener) => listener());
  };
  const parseClosed = (raw: string | null): ClosedInfo | undefined => {
    if (!raw) return undefined;
    try {
      const value: unknown = JSON.parse(raw);
      if (typeof value !== 'object' || value === null) return undefined;
      const { at, run } = value as Record<string, unknown>;
      if (typeof at === 'number' && Number.isFinite(at) && at > 0)
        if (typeof run === 'number' && Number.isInteger(run) && run > 0)
          return { at, run };
    } catch {
      // A malformed record only loses the date, never the close itself.
    }
    return undefined;
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
      const storedInfo = new Map<string, ClosedInfo>();
      for (const id of saved) {
        const info = parseClosed(storage.getItem(closedKey(generation, id)));
        if (info) storedInfo.set(id, info);
      }
      if (generationOf(storage) !== generation)
        throw new Error('Progress changed while reading');
      const changed = generation !== snapshot.generation;
      if (changed) {
        pending.clear();
        recorded.clear();
      }
      stored = storedInfo;
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
      for (const id of pending) {
        const info = recorded.get(id);
        if (info)
          storage.setItem(closedKey(generation, id), JSON.stringify(info));
        storage.setItem(key(generation, id), '1');
      }
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
    markComplete(id: string, token: RunToken, info?: ClosedInfo) {
      const current = () =>
        token.generation === snapshot.generation &&
        token.version === snapshot.version;
      if (!known.has(id) || !current()) return;
      const readable = refresh();
      // The first close stands; a later passing run never rewrites it.
      if (!current() || snapshot.saved.has(id)) return;
      if (info && !recorded.has(id)) recorded.set(id, info);
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
        recorded.clear();
        stored = new Map();
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
