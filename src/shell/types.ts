import type { Helpers } from './checks/harness';

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Check {
  name: string;
  run: (h: Helpers) => Promise<void>;
}

export interface LevelManifest {
  /** 'NN-kebab-slug' — also the level's route segment under /lab/ */
  id: string;
  number: number;
  title: string;
  concept: string;
  severity: Severity;
  /** The lab route this level lives at, e.g. '/lab/01-foo' */
  route: string;
  /** Where to look. When `vague` is true these are folders, not files. */
  files: string[];
  vague?: boolean;
  /** QA-ticket-style description of observable behavior only. */
  symptom: string;
  /** Lesson paragraphs; `backticks` render as <code>. */
  lesson: string[];
  checks: Check[];
}
