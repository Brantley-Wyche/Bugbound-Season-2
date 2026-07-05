'use client';

import { useState } from 'react';

export default function JoinPanel() {
  const [busy, setBusy] = useState(false);

  async function join() {
    setBusy(true);
    await fetch('/lab/12-the-bouncer/api/join', { method: 'POST' });
    // Full navigation on purpose: the gate runs on the server, so we let the
    // next request present the fresh cookie at the door.
    window.location.assign('/lab/12-the-bouncer/beta');
  }

  return (
    <button className="lv-btn primary" data-testid="join-beta" onClick={join} disabled={busy}>
      {busy ? 'Joining…' : 'Join the beta'}
    </button>
  );
}
