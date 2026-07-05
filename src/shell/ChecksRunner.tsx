'use client';

import { useState } from 'react';
import { runCheck, type CheckResult } from './harness';
import type { LevelManifest } from './types';

type Row = CheckResult | { name: string; pending: true };

export default function ChecksRunner({
  level,
  onAllPass,
}: {
  level: LevelManifest;
  onAllPass: () => void;
}) {
  const [results, setResults] = useState<Row[] | null>(null);
  const [running, setRunning] = useState(false);

  async function runAll() {
    setRunning(true);
    setResults(level.checks.map((c) => ({ name: c.name, pending: true })));

    const finished: CheckResult[] = [];
    for (const check of level.checks) {
      const result = await runCheck(check);
      finished.push(result);
      setResults([
        ...finished,
        ...level.checks.slice(finished.length).map((c) => ({ name: c.name, pending: true as const })),
      ]);
    }

    setRunning(false);
    if (finished.every((r) => r.pass)) onAllPass();
  }

  return (
    <div className="panel panel-checks">
      <h3>Checks</h3>
      <button className="btn btn-primary" onClick={runAll} disabled={running}>
        {running ? 'Running…' : results ? 'Re-run checks' : 'Run checks'}
      </button>

      {results ? (
        <div className="checks-list">
          {results.map((r, i) => {
            const pending = 'pending' in r;
            const pass = !pending && r.pass;
            return (
              <div key={i} className={`check-row ${pending ? 'pending' : pass ? 'pass' : 'fail'}`}>
                <span className="check-chip">{pending ? 'PEND' : pass ? 'PASS' : 'FAIL'}</span>
                <div className="check-body">
                  <div className="check-name">{r.name}</div>
                  {!pending && !r.pass && <div className="check-error">{r.message}</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="checks-idle">
          Fix the bug in your editor (the page hot-reloads), then run the checks. The checks
          hit the real routes — server rendering included. All green unlocks the next level.
        </p>
      )}
    </div>
  );
}
