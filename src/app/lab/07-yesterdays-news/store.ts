export interface Headline {
  id: number;
  text: string;
  at: string;
}

interface NewsStore {
  nextId: number;
  headlines: Headline[];
}

// Dev-friendly in-memory store: stashed on globalThis so every server module
// sees the same instance across requests and hot reloads.
const g = globalThis as unknown as { __s2NewsStore?: NewsStore };
if (!g.__s2NewsStore) {
  g.__s2NewsStore = {
    nextId: 3,
    headlines: [
      { id: 1, text: 'Ferry timetable survives winter storm season', at: '08:12' },
      { id: 2, text: 'Harbor Hall roof repairs finish two days early', at: '09:40' },
    ],
  };
}
const store = g.__s2NewsStore;

export function getHeadlines(): Headline[] {
  return [...store.headlines].reverse();
}

export function addHeadline(text: string): Headline {
  const headline: Headline = {
    id: store.nextId++,
    text,
    at: new Date().toTimeString().slice(0, 5),
  };
  store.headlines.push(headline);
  return headline;
}
