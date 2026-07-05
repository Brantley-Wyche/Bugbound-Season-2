'use client';

import { useState } from 'react';
import { runCheck, type CheckResult } from './harness';
import type { LevelManifest } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import PanelTitle from './PanelTitle';

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
    <Card className="gap-4">
      <CardHeader>
        <PanelTitle color="ok">Checks</PanelTitle>
      </CardHeader>
      <CardContent className="space-y-3.5">
        <Button
          onClick={runAll}
          disabled={running}
          className="font-mono text-xs font-semibold uppercase tracking-[0.08em]"
        >
          {running ? 'Running…' : results ? 'Re-run checks' : 'Run checks'}
        </Button>

        {results ? (
          <div className="space-y-1.5">
            {results.map((r, i) => {
              const pending = 'pending' in r;
              const pass = !pending && r.pass;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-3 rounded-md border border-l-[3px] bg-background px-3 py-2.5 text-[13.5px]',
                    pending ? 'border-l-border-strong' : pass ? 'border-l-ok' : 'border-l-err',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 shrink-0 rounded-[3px] px-1.5 py-px font-mono text-[10.5px] font-bold tracking-[0.08em]',
                      pending
                        ? 'bg-panel-2 text-muted-foreground'
                        : pass
                          ? 'bg-ok/12 text-ok'
                          : 'bg-err/10 text-err',
                    )}
                  >
                    {pending ? 'PEND' : pass ? 'PASS' : 'FAIL'}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold">{r.name}</div>
                    {!pending && !r.pass && (
                      <div className="mt-1 whitespace-pre-wrap break-words font-mono text-xs text-[#f1a9a4]">
                        {r.message}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[13.5px] text-muted-foreground">
            Fix the bug in your editor (the page hot-reloads), then run the checks. The checks
            hit the real routes — server rendering included. All green unlocks the next level.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
