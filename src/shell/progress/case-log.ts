// The case log: what the learner actually did on each incident, kept in this
// browser. It records only real events (never hint text) and outlives a
// progress reset, which it notes as its own entry.
export const LOG_PREFIX = 'bugbound:s2:log:v1:';
const RESETS_KEY = `${LOG_PREFIX}resets`;
const MAX_EVENTS = 50;
const HINT_TIERS = 3;

export type RunStatus = 'passed' | 'failed' | 'cancelled' | 'error';
export type LogEvent =
  | { type: 'opened'; at: number }
  | {
      type: 'run';
      at: number;
      run: number;
      status: RunStatus;
      passed: number;
      total: number;
      closed?: boolean;
    }
  | { type: 'hint'; at: number; tier: number };
export type LogEntry = LogEvent | { type: 'reset'; at: number };
export type IncidentLog = { runs: number; events: readonly LogEvent[] };
type Snapshot = {
  logs: ReadonlyMap<string, IncidentLog>;
  resets: readonly number[];
  writeError: boolean;
};
type StorageAccess = Pick<Storage, 'getItem' | 'setItem'>;

const EMPTY: IncidentLog = { runs: 0, events: [] };
const SERVER_SNAPSHOT: Snapshot = {
  logs: new Map(),
  resets: [],
  writeError: false,
};
const STATUSES: readonly string[] = ['passed', 'failed', 'cancelled', 'error'];
const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;
const isTime = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

function parseEvent(value: unknown): LogEvent | null {
  if (typeof value !== 'object' || value === null) return null;
  const event = value as Record<string, unknown>;
  if (!isTime(event.at)) return null;
  if (event.type === 'opened') return { type: 'opened', at: event.at };
  if (event.type === 'hint' && isCount(event.tier) && event.tier < HINT_TIERS)
    return { type: 'hint', at: event.at, tier: event.tier };
  if (
    event.type === 'run' &&
    isCount(event.run) &&
    event.run > 0 &&
    typeof event.status === 'string' &&
    STATUSES.includes(event.status) &&
    isCount(event.passed) &&
    isCount(event.total)
  )
    return {
      type: 'run',
      at: event.at,
      run: event.run,
      status: event.status as RunStatus,
      passed: event.passed,
      total: event.total,
      ...(event.closed === true ? { closed: true } : {}),
    };
  return null;
}

function parseLog(raw: string | null): IncidentLog | undefined {
  if (!raw) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return undefined;
    const { runs, events } = value as Record<string, unknown>;
    return {
      runs: isCount(runs) ? runs : 0,
      events: Array.isArray(events)
        ? events.map(parseEvent).filter((event) => event !== null)
        : [],
    };
  } catch {
    return undefined;
  }
}

function parseResets(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter(isTime) : [];
  } catch {
    return [];
  }
}

/** One incident's entries, newest first, with resets that came after its first activity. */
export function entriesFor(snapshot: Snapshot, id: string): LogEntry[] {
  const events = snapshot.logs.get(id)?.events ?? [];
  if (events.length === 0) return [];
  const first = Math.min(...events.map((event) => event.at));
  const resets = snapshot.resets
    .filter((at) => at > first)
    .map((at) => ({ type: 'reset' as const, at }));
  return [...events, ...resets].sort((a, b) => b.at - a.at);
}

export function createCaseLog(
  ids: readonly string[],
  getStorage: () => StorageAccess,
  now: () => number = Date.now,
) {
  const listeners = new Set<() => void>();
  let snapshot = SERVER_SNAPSHOT;
  const key = (id: string) => `${LOG_PREFIX}${id}`;
  const publish = (fields: Partial<Snapshot>) => {
    snapshot = { ...snapshot, ...fields };
    listeners.forEach((listener) => listener());
  };

  function refresh() {
    try {
      const storage = getStorage();
      const logs = new Map<string, IncidentLog>();
      for (const id of ids) {
        const log = parseLog(storage.getItem(key(id)));
        if (log) logs.set(id, log);
      }
      // Keep entries this tab could not save rather than dropping them.
      for (const [id, log] of snapshot.logs) {
        const stored = logs.get(id);
        if (
          !stored ||
          log.runs > stored.runs ||
          log.events.length > stored.events.length
        )
          logs.set(id, log);
      }
      publish({ logs, resets: parseResets(storage.getItem(RESETS_KEY)) });
    } catch {
      // Unreadable storage leaves the in-memory log as it is.
    }
  }

  function write(
    id: string,
    change: (log: IncidentLog) => IncidentLog | null,
  ): IncidentLog {
    let storage: StorageAccess | undefined;
    let base = snapshot.logs.get(id) ?? EMPTY;
    try {
      storage = getStorage();
      const stored = parseLog(storage.getItem(key(id)));
      if (
        stored &&
        stored.runs >= base.runs &&
        stored.events.length >= base.events.length
      )
        base = stored;
    } catch {
      storage = undefined;
    }
    const changed = change(base);
    if (!changed) return base;
    const next = { ...changed, events: changed.events.slice(-MAX_EVENTS) };
    let failed = !storage;
    try {
      storage?.setItem(key(id), JSON.stringify(next));
    } catch {
      failed = true;
    }
    publish({
      logs: new Map(snapshot.logs).set(id, next),
      writeError: failed,
    });
    return next;
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
    recordOpened(id: string) {
      write(id, (log) =>
        log.events.length > 0
          ? null
          : { ...log, events: [{ type: 'opened', at: now() }] },
      );
    },
    /** Reserves the next lifetime run number for this incident. */
    startRun(id: string): number {
      return write(id, (log) => ({ ...log, runs: log.runs + 1 })).runs;
    },
    recordRun(
      id: string,
      result: Omit<Extract<LogEvent, { type: 'run' }>, 'type' | 'at'>,
    ) {
      write(id, (log) => ({
        runs: Math.max(log.runs, result.run),
        events: [...log.events, { type: 'run', at: now(), ...result }],
      }));
    },
    recordHint(id: string, tier: number) {
      if (!Number.isInteger(tier) || tier < 0 || tier >= HINT_TIERS) return;
      write(id, (log) =>
        log.events.some((event) => event.type === 'hint' && event.tier === tier)
          ? null
          : {
              ...log,
              events: [...log.events, { type: 'hint', at: now(), tier }],
            },
      );
    },
    recordReset() {
      const at = now();
      let failed = false;
      try {
        const storage = getStorage();
        const resets = [...parseResets(storage.getItem(RESETS_KEY)), at];
        storage.setItem(RESETS_KEY, JSON.stringify(resets.slice(-MAX_EVENTS)));
      } catch {
        failed = true;
      }
      publish({ resets: [...snapshot.resets, at], writeError: failed });
    },
  };
}
