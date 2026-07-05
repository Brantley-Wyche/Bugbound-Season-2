import type { LevelManifest } from '@/shell/types';

/** Level registry — one import per level, sorted by number. */
const manifests: LevelManifest[] = [];

export const levels = manifests.sort((a, b) => a.number - b.number);
