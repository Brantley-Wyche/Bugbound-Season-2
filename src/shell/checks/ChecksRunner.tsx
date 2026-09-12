'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Play, Square, Check, X, Circle } from 'lucide-react';
import { runCheck, LabCleanupError, type CheckResult } from './harness';
import type { LevelManifest } from '../types';
import { Button } from '@/components/ui/button';
import { Toolbar, ToolbarButton } from '@/components/ui/toolbar';
import { useProgress } from '../progress/ProgressProvider';
import type { RunToken } from '../progress/progress-store';
import LabDataReset from './LabDataReset';

type Row = CheckResult | { name: string; pending: true };

export default function ChecksRunner({
  level,
  onAllPass,
  children,
  onFixtureReset,
}: {
  children?: ReactNode;
  level: LevelManifest;
  onAllPass: (token: RunToken) => void;
  onFixtureReset?: () => void;
}) {
  const [results, setResults] = useState<Row[] | null>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('Not checked this visit.');
  const [runError, setRunError] = useState<string | null>(null);
  const active = useRef<AbortController | null>(null);
  const { captureRun } = useProgress();

  useEffect(
    () => () => {
      active.current?.abort();
      active.current = null;
    },
    [],
  );

  async function runAll() {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const token = captureRun();
    setRunning(true);
    setRunError(null);
    setResults(level.checks.map((c) => ({ name: c.name, pending: true })));

    const finished: CheckResult[] = [];
    let cleanupFailed = false;
    try {
      for (const check of level.checks) {
        setStatus(
          `Running check ${finished.length + 1} of ${level.checks.length}.`,
        );
        const result = await runCheck(check, { signal: controller.signal });
        controller.signal.throwIfAborted();
        finished.push(result);
        setResults([
          ...finished,
          ...level.checks
            .slice(finished.length)
            .map((c) => ({ name: c.name, pending: true as const })),
        ]);
      }
      const passed = finished.filter((result) => result.pass).length;
      setStatus(`Last run: ${passed} of ${finished.length} checks passed.`);
      if (finished.length > 0 && finished.every((result) => result.pass))
        onAllPass(token);
    } catch (error) {
      cleanupFailed = error instanceof LabCleanupError;
      if (!controller.signal.aborted) {
        setStatus(
          'The check runner could not finish. Retry the checks. If it happens again, restart the dev server.',
        );
        setRunError(error instanceof Error ? error.message : String(error));
      }
    } finally {
      if (active.current === controller) {
        active.current = null;
        setRunning(false);
        if (controller.signal.aborted)
          setStatus(
            cleanupFailed
              ? 'Check run cancelled. Lab session cleanup failed; stop other lab activity and retry. No completion was recorded.'
              : 'Check run cancelled. No completion was recorded.',
          );
      }
    }
  }

  function cancel() {
    active.current?.abort();
    setResults((rows) => rows?.filter((row) => !('pending' in row)) ?? null);
    setStatus('Cancelling checks and cleaning up the lab session...');
  }

  return (
    <section className="evidence-section" aria-labelledby="checks-title">
      <div className="evidence-bar">
        <h2 id="checks-title">Evidence</h2>
        <Toolbar
          aria-label="Verification controls"
          className="verification-toolbar"
        >
          <ToolbarButton
            render={<Button disabled={running} />}
            onClick={runAll}
          >
            <Play aria-hidden="true" />
            {running ? 'Running...' : results ? 'Re-run checks' : 'Run checks'}
          </ToolbarButton>
          {running && (
            <ToolbarButton
              render={<Button variant="outline" />}
              onClick={cancel}
            >
              <Square aria-hidden="true" />
              Cancel
            </ToolbarButton>
          )}
        </Toolbar>
      </div>
      {level.id === '13-launch-day' &&
        process.env.NODE_ENV === 'development' && (
          <div className="fixture-controls">
            <LabDataReset
              disabled={running}
              onReset={() => {
                setResults(null);
                setRunError(null);
                setStatus(
                  'Lab data reset. Run checks to verify the current source.',
                );
                onFixtureReset?.();
              }}
            />
          </div>
        )}
      {children}
      <div className="check-results">
        <div className="section-heading">
          <h3>Verification</h3>
          <span>{level.checks.length} checks</span>
        </div>
        <p
          className="check-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {status}
        </p>
        {runError && (
          <details>
            <summary>Technical details</summary>
            <pre>{runError}</pre>
          </details>
        )}
        <ol>
          {(
            results ??
            level.checks.map((check) => ({
              name: check.name,
              pending: true as const,
            }))
          ).map((row, index) => {
            const pending = 'pending' in row;
            const pass = !pending && row.pass;
            return (
              <li
                key={index}
                className={
                  pending ? 'check-pending' : pass ? 'check-pass' : 'check-fail'
                }
              >
                <span className="check-symbol">
                  {pending ? (
                    <Circle size={15} aria-hidden="true" />
                  ) : pass ? (
                    <Check size={17} aria-hidden="true" />
                  ) : (
                    <X size={17} aria-hidden="true" />
                  )}
                </span>
                <div>
                  <span className="check-name">{row.name}</span>
                  {!pending && !row.pass && (
                    <p className="check-message">{row.message}</p>
                  )}
                </div>
                <span className="check-state">
                  {pending
                    ? running
                      ? 'Pending'
                      : 'Not run'
                    : pass
                      ? 'Pass'
                      : 'Fail'}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
