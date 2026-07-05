'use client';

import { useCallback, useEffect, useState } from 'react';

interface Stats {
  praise: number;
  gripes: number;
  total: number;
}

export default function FeedbackPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch('/lab/10-mute-endpoint/api/stats');
    if (!res.ok) {
      setFailed(true);
      return;
    }
    setFailed(false);
    setStats(await res.json());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function send(kind: 'praise' | 'gripe') {
    await fetch('/lab/10-mute-endpoint/api/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind }),
    });
    await refresh();
  }

  return (
    <div className="lv-card">
      <h2 className="lv-heading">The tally</h2>
      {failed ? (
        <p className="lv-muted" data-testid="stats-error">
          Stats unavailable — the endpoint answered with an error.
        </p>
      ) : !stats ? (
        <p className="lv-muted" data-testid="stats-loading">
          Loading stats…
        </p>
      ) : (
        <div className="lv-row">
          <span className="lv-stat" data-testid="stat-total">
            {stats.total}
          </span>
          <span className="lv-muted">
            responses · <span data-testid="stat-praise">{stats.praise}</span> praise ·{' '}
            <span data-testid="stat-gripes">{stats.gripes}</span> gripes
          </span>
        </div>
      )}
      <div className="lv-row">
        <button className="lv-btn primary" data-testid="send-praise" onClick={() => send('praise')}>
          Send praise
        </button>
        <button className="lv-btn" data-testid="send-gripe" onClick={() => send('gripe')}>
          File a gripe
        </button>
      </div>
    </div>
  );
}
