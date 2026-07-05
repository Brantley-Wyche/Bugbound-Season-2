'use client';

import { useState } from 'react';

export default function WelcomeCard() {
  const [checkedIn, setCheckedIn] = useState(false);
  const visitorNumber = Math.floor(Math.random() * 9000) + 1000;
  const openedAt = new Date().toLocaleTimeString();

  return (
    <div className="lv-card" data-testid="welcome-card">
      <h2 className="lv-heading" data-testid="greeting">
        Welcome back, member!
      </h2>
      <p className="lv-muted">
        You are visitor <strong data-testid="visitor-num">#{visitorNumber}</strong> today.
      </p>
      <p className="lv-muted">
        Lounge session opened at <span data-testid="opened-at">{openedAt}</span>.
      </p>
      <div className="lv-row">
        <button className="lv-btn" data-testid="check-in" onClick={() => setCheckedIn(true)}>
          {checkedIn ? 'Checked in ✓' : 'Check in'}
        </button>
        {checkedIn && (
          <span className="lv-tag ok" data-testid="checked-in-tag">
            On the board
          </span>
        )}
      </div>
    </div>
  );
}
