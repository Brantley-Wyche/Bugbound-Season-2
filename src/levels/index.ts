import type { LevelManifest } from '@/shell/types';

import level01 from './01-vanishing-venue/manifest';
import level02 from './02-forgetful-cart/manifest';
import level03 from './03-dead-on-arrival/manifest';
import level04 from './04-invisible-storefront/manifest';
import level05 from './05-shape-shifter/manifest';
import level06 from './06-lost-in-the-params/manifest';
import level07 from './07-yesterdays-news/manifest';
import level08 from './08-silent-guestbook/manifest';
import level09 from './09-slow-lane/manifest';
import level10 from './10-mute-endpoint/manifest';
import level11 from './11-untitled-document/manifest';
import level12 from './12-the-bouncer/manifest';
import level13 from './13-launch-day/manifest';

const manifests: LevelManifest[] = [
  level01,
  level02,
  level03,
  level04,
  level05,
  level06,
  level07,
  level08,
  level09,
  level10,
  level11,
  level12,
  level13,
];

export const levels = manifests.sort((a, b) => a.number - b.number);
