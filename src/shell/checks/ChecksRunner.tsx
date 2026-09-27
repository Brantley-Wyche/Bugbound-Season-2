'use client';

import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Circle, Play, Square, X } from 'lucide-react';
import { runCheck, LabCleanupError, type CheckResult } from './harness';
import type { LevelManifest } from '../types';
import { Button } from '@/components/ui/button';
import { Toolbar, ToolbarButton, ToolbarLink } from '@/components/ui/toolbar';
import { useCaseLog, useProgress } from '../progress/ProgressProvider';
import type { ClosedInfo, RunToken } from '../progress/progress-store';
import { bugId, folio, formatDay, formatTime } from '../format';
import LabDataReset from './LabDataReset';

type Row = CheckResult | { name: string; pending: true };
type RunStatus = 'running' | 'passed' | 'failed' | 'cancelled' | 'error';
type Run = {
  n: number;
  at: number;
  status: RunStatus;
  rows: Row[];
  passed: number;
  /** Set on the run that first closes the incident in this visit. */
  closedAt?: number;
  error?: string;
};
export type NextIncident = { id: string; number: number; title: string };

const SAVED_NOTE =
  'A new run checks the source as it is now. It never reopens the case.';
const UNSAVED_NOTE = 'Until it saves, the close lasts only for this visit.';

export default function ChecksRunner({
  level,
  isComplete,
  isSaved,
  closedInfo,
  next,
  onAllPass,
  children,
  onFixtureReset,
}: {
  children?: ReactNode;
  level: LevelManifest;
  isComplete: boolean;
  isSaved: boolean;
  closedInfo?: ClosedInfo;
  next?: NextIncident;
  onAllPass: (token: RunToken, info: ClosedInfo) => void;
  onFixtureReset?: () => void;
}) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const [stuck, setStuck] = useState(false);
  const active = useRef<AbortController | null>(null);
  const runButton = useRef<HTMLButtonElement>(null);
  const entry = useRef<HTMLParagraphElement>(null);
  const closedHeading = useRef<HTMLHeadingElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const { captureRun } = useProgress();
  const { startRun, recordRun } = useCaseLog();

  const total = level.checks.length;
  const id = bugId(level.number);
  const current = runs.at(-1);
  const running = current?.status === 'running';
  const settled = runs.findLast((run) => run.status !== 'running');
  // Amber marks the next thing to do: Run while the case is open or a later
  // run fails, Next once it is closed.
  const failing = settled?.status === 'failed' || settled?.status === 'error';
  const nextIsPrimary = isComplete && !failing;
  const closingRun =
    current?.status === 'passed' && current.closedAt ? current.n : null;

  useEffect(
    () => () => {
      active.current?.abort();
      active.current = null;
    },
    [],
  );

  // The one moment the page moves: the closing run brings its record into view.
  useEffect(() => {
    const heading = closedHeading.current;
    if (closingRun === null || !heading) return;
    heading.scrollIntoView({ block: 'center' });
    heading.focus({ preventScroll: true });
  }, [closingRun]);

  // The sticky workbench gains its lower rule only while content scrolls under it.
  useEffect(() => {
    const marker = sentinel.current;
    if (!marker || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([observed]) =>
        setStuck(
          !observed.isIntersecting && observed.boundingClientRect.top < 67,
        ),
      { rootMargin: '-67px 0px 0px 0px' },
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, []);

  async function runAll() {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const token = captureRun();
    const wasComplete = isComplete;
    // Runs are numbered across every visit to this incident.
    const n = startRun(level.id);
    const waiting = level.checks.map((check) => ({
      name: check.name,
      pending: true as const,
    }));
    const update = (patch: Partial<Run>) =>
      setRuns((all) =>
        all.map((run) => (run.n === n ? { ...run, ...patch } : run)),
      );
    setRuns((all) => [
      ...all,
      { n, at: Date.now(), status: 'running', rows: waiting, passed: 0 },
    ]);
    setAnnouncement(`Run ${n} started.`);

    const finished: CheckResult[] = [];
    let cleanupFailed = false;
    try {
      for (const check of level.checks) {
        const result = await runCheck(check, { signal: controller.signal });
        controller.signal.throwIfAborted();
        finished.push(result);
        update({ rows: [...finished, ...waiting.slice(finished.length)] });
      }
      const passed = finished.filter((result) => result.pass).length;
      const allPass = finished.length > 0 && passed === finished.length;
      const closedAt = allPass && !wasComplete ? Date.now() : undefined;
      update({ status: allPass ? 'passed' : 'failed', passed, closedAt });
      recordRun(level.id, {
        run: n,
        status: allPass ? 'passed' : 'failed',
        passed,
        total,
        ...(closedAt ? { closed: true } : {}),
      });
      if (allPass) onAllPass(token, { at: Date.now(), run: n });
      setAnnouncement(
        closedAt
          ? `Closed. ${id} closed on run ${n}; all ${total} checks passed.`
          : `Run ${n}: ${passed} of ${finished.length} checks passed.`,
      );
    } catch (error) {
      cleanupFailed = error instanceof LabCleanupError;
      if (!controller.signal.aborted) {
        const passed = finished.filter((result) => result.pass).length;
        update({
          status: 'error',
          passed,
          error: error instanceof Error ? error.message : String(error),
        });
        recordRun(level.id, { run: n, status: 'error', passed, total });
        setAnnouncement(
          'The check runner could not finish. Retry the checks. If it happens again, restart the dev server.',
        );
      }
    } finally {
      // A cancelled run (including one abandoned by leaving the page) stays in the log.
      if (controller.signal.aborted)
        recordRun(level.id, {
          run: n,
          status: 'cancelled',
          passed: finished.filter((result) => result.pass).length,
          total,
        });
      if (active.current === controller) {
        active.current = null;
        if (controller.signal.aborted) {
          update({
            status: 'cancelled',
            rows: finished,
            passed: finished.filter((result) => result.pass).length,
          });
          setAnnouncement(
            cleanupFailed
              ? 'Check run cancelled. Lab session cleanup failed; stop other lab activity and retry. No completion was recorded.'
              : 'Check run cancelled. No completion was recorded.',
          );
        }
      }
    }
  }

  function cancel() {
    active.current?.abort();
    setAnnouncement('Cancelling checks and cleaning up the lab session…');
    // Cancel unmounts when the run settles; keep keyboard focus in the toolbar.
    runButton.current?.focus();
  }

  function showEntry() {
    entry.current?.scrollIntoView({ block: 'start' });
    entry.current?.focus({ preventScroll: true });
  }

  const closedDay = closedInfo
    ? `Closed ${formatDay(closedInfo.at)}`
    : 'Closed';
  const rows =
    current?.rows ??
    level.checks.map((check) => ({ name: check.name, pending: true as const }));
  const firstPending = rows.findIndex((row) => 'pending' in row);
  const checking = Math.min(
    (firstPending === -1 ? rows.length : firstPending) + 1,
    total,
  );

  return (
    <section className="evidence-section" aria-labelledby="checks-title">
      <div ref={sentinel} className="evidence-sentinel" aria-hidden="true" />
      <div className="evidence-bar" data-stuck={stuck || undefined}>
        <div className="evidence-lead">
          <h2 id="checks-title">Evidence</h2>
          {running ? (
            <span className="evidence-verdict">
              Running check {checking} of {total}…
            </span>
          ) : current ? (
            <button
              type="button"
              className="evidence-verdict evidence-jump"
              onClick={showEntry}
            >
              Run {current.n} ·{' '}
              <RunResult run={current} total={total} withClosed={isComplete} />
            </button>
          ) : isComplete ? (
            <span className="evidence-verdict">
              <span className="state-closed">{closedDay}</span> · Not run this
              visit
            </span>
          ) : (
            <span className="evidence-verdict">
              {total} checks to pass · Not run this visit
            </span>
          )}
        </div>
        <Toolbar
          aria-label="Verification controls"
          className="verification-toolbar"
        >
          {/* Focusable while disabled (aria-disabled), so a keyboard run keeps focus. */}
          <ToolbarButton
            disabled={running}
            render={
              <Button
                ref={runButton}
                variant={nextIsPrimary ? 'outline' : 'default'}
              />
            }
            onClick={runAll}
          >
            <Play aria-hidden="true" />
            {running
              ? 'Running…'
              : runs.length
                ? 'Re-run checks'
                : 'Run checks'}
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
          {isComplete && (
            <ToolbarLink
              className="next-incident-link"
              render={
                <Button
                  variant={nextIsPrimary ? 'default' : 'outline'}
                  render={<Link href={next ? `/level/${next.id}` : '/'} />}
                />
              }
            >
              {next ? (
                <span>
                  Next: <span className="mono">{folio(next.number)}</span>{' '}
                  {next.title}
                </span>
              ) : (
                'Season record'
              )}
              <ArrowRight aria-hidden="true" />
            </ToolbarLink>
          )}
        </Toolbar>
      </div>
      {level.id === '13-launch-day' &&
        process.env.NODE_ENV === 'development' && (
          <div className="fixture-controls">
            <LabDataReset
              disabled={running}
              onReset={() => {
                setRuns([]);
                setAnnouncement(
                  'Lab data reset. Run checks to verify the current source.',
                );
                onFixtureReset?.();
              }}
            />
          </div>
        )}
      {children}
      <div className="verification-record">
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {announcement}
        </p>
        <div className="section-heading">
          <h3>Verification record</h3>
          <span>{total} checks</span>
        </div>
        {current ? (
          <p
            ref={entry}
            tabIndex={-1}
            className="record-entry"
            id={`run-entry-${level.id}`}
          >
            <span className="record-entry-run">Run {current.n}</span>
            <span className="record-entry-time">{formatTime(current.at)}</span>
            <RunResult run={current} total={total} withClosed={false} />
          </p>
        ) : (
          isComplete && (
            <ClosedEntry id={id} info={closedInfo} isSaved={isSaved} standing />
          )
        )}
        {current?.error && (
          <details className="record-details">
            <summary>Technical details</summary>
            <pre>{current.error}</pre>
          </details>
        )}
        <ol className="check-list">
          {rows.map((row, index) => {
            const pending = 'pending' in row;
            const pass = !pending && row.pass;
            const now = running && index === firstPending;
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
                    ? now
                      ? 'Running'
                      : running
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
        {current?.closedAt && current.status === 'passed' ? (
          <ClosedEntry
            id={id}
            info={{ at: current.closedAt, run: current.n }}
            isSaved={isSaved}
            headingRef={closedHeading}
          />
        ) : (
          isComplete &&
          current &&
          !running && (
            <div className="closed-standing-note">
              <p>
                <span className="state-closed">{closedDay}</span> still stands.
                {current.status === 'passed' &&
                  ` The current source passes all ${total} checks.`}
              </p>
              {current.status === 'failed' && (
                <p className="closed-note">
                  The current source fails {total - current.passed} of {total}{' '}
                  checks. A run never reopens a closed case; it only reports the
                  source as it is now.
                </p>
              )}
            </div>
          )
        )}
      </div>
    </section>
  );
}

function RunResult({
  run,
  total,
  withClosed,
}: {
  run: Run;
  total: number;
  withClosed: boolean;
}) {
  const text =
    run.status === 'running'
      ? 'Running'
      : run.status === 'cancelled'
        ? 'Cancelled'
        : run.status === 'error'
          ? 'Could not finish'
          : `${run.passed} of ${total} passed`;
  const tone =
    run.status === 'passed'
      ? 'result-pass'
      : run.status === 'failed' || run.status === 'error'
        ? 'result-fail'
        : 'result-muted';
  return (
    <span className={tone}>
      {text}
      {withClosed && run.status === 'passed' ? ' · Closed' : ''}
    </span>
  );
}

function ClosedEntry({
  id,
  info,
  isSaved,
  standing = false,
  headingRef,
}: {
  id: string;
  info?: ClosedInfo;
  isSaved: boolean;
  standing?: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  const when = info
    ? `closed ${formatDay(info.at)} at ${formatTime(info.at)} on run ${info.run}.`
    : 'was closed on an earlier visit.';
  return (
    <div className="closed-entry" data-standing={standing || undefined}>
      <span className="closed-rule" aria-hidden="true" />
      <h4 ref={headingRef} tabIndex={-1} className="closed-heading">
        <Check aria-hidden="true" />
        Closed
      </h4>
      <p>
        <span className="mono">{id}</span> {when}{' '}
        {isSaved
          ? 'Saved in this browser.'
          : 'Not saved yet: use Retry saving above.'}
      </p>
      <p className="closed-note">{isSaved ? SAVED_NOTE : UNSAVED_NOTE}</p>
    </div>
  );
}
