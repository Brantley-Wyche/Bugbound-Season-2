'use client';

import { useState } from 'react';
import hints from '@/levels/hints.json';

const TIER_LABELS = ['Gentle nudge', 'Closer look', 'Basically the answer'];

function decode(b64: string) {
  return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
}

export default function HintBox({ levelId }: { levelId: string }) {
  const [revealed, setRevealed] = useState([false, false, false]);
  const encoded: string[] = (hints as Record<string, string[]>)[levelId] ?? [];

  return (
    <div className="panel panel-hints">
      <h3>Hints</h3>
      <p className="hints-note">
        Hints are stored encoded so you can&apos;t spoil yourself by accident. Reveal them one
        at a time — a real debugging attempt first is worth more than all three combined.
      </p>
      <div className="hint-list">
        {encoded.map((b64, i) => (
          <div className="hint-item" key={i}>
            <button
              className="hint-toggle"
              onClick={() =>
                setRevealed((prev) => prev.map((v, j) => (j === i ? !v : v)))
              }
            >
              <span>Hint {i + 1}</span>
              <span className="tier">{revealed[i] ? 'hide' : TIER_LABELS[i]}</span>
            </button>
            {revealed[i] && <div className="hint-body">{decode(b64)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
