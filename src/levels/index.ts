import catalog from './generated/catalog.json';
import type { LevelManifest } from '@/shell/types';

export type LevelSummary = Pick<LevelManifest, 'id' | 'number' | 'title' | 'concept' | 'severity' | 'symptom'>;
export const levels = catalog as LevelSummary[];
