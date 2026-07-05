export interface Entry {
  id: number;
  message: string;
  at: string;
}

interface GuestbookStore {
  nextId: number;
  entries: Entry[];
}

const g = globalThis as unknown as { __s2Guestbook?: GuestbookStore };
if (!g.__s2Guestbook) {
  g.__s2Guestbook = {
    nextId: 3,
    entries: [
      { id: 1, message: 'Best pour-over on the peninsula. The heron agrees.', at: 'Tue' },
      { id: 2, message: 'Came for the coffee, stayed because the ferry left without me.', at: 'Wed' },
    ],
  };
}
const store = g.__s2Guestbook;

export function getEntries(): Entry[] {
  return [...store.entries].reverse();
}

export function addEntry(message: string): Entry {
  const entry: Entry = {
    id: store.nextId++,
    message,
    at: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
  };
  store.entries.push(entry);
  return entry;
}
