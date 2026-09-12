import { levels, type LevelSummary } from './index';

export const acts = [
  { name: 'Routes & server boundary', from: 1, to: 5 },
  { name: 'Data, caching & mutations', from: 6, to: 10 },
  { name: 'Platform & capstone', from: 11, to: 13 },
];

export function isUnlocked(level: LevelSummary, completed: ReadonlySet<string>) {
  if (level.number === 1) return true;
  const previous = levels.find(item => item.number === level.number - 1);
  return previous ? completed.has(previous.id) : false;
}
