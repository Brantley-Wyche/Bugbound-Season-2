'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PublishForm() {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function publish() {
    if (!text.trim()) return;
    setBusy(true);
    await fetch('/lab/07-yesterdays-news/api', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    setText('');
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="lv-row">
      <input
        className="lv-input"
        style={{ flex: 1 }}
        placeholder="Breaking: …"
        value={text}
        data-testid="headline-input"
        onChange={(e) => setText(e.target.value)}
      />
      <button className="lv-btn primary" data-testid="publish" onClick={publish} disabled={busy}>
        {busy ? 'Publishing…' : 'Publish'}
      </button>
    </div>
  );
}
