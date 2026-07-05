'use client';

import { useEffect } from 'react';

/** Set once React has hydrated the lab frame — the harness polls for this
 *  before driving the page. Fires even after a hydration-mismatch recovery,
 *  because React still mounts effects after falling back to client render. */
export default function LabBeacon() {
  useEffect(() => {
    (window as Window & { __labHydrated?: boolean }).__labHydrated = true;
  }, []);
  return null;
}
