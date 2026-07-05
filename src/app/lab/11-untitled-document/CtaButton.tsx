'use client';

import { useState } from 'react';

export default function CtaButton() {
  const [joined, setJoined] = useState(false);

  return (
    <div className="lv-row">
      <button className="lv-btn primary" data-testid="cta" onClick={() => setJoined(true)}>
        Get early access
      </button>
      {joined && (
        <span className="lv-tag ok" data-testid="cta-confirm">
          You’re on the list — check your inbox
        </span>
      )}
    </div>
  );
}
