'use client';

import type { MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, LockKeyhole, RotateCcw } from 'lucide-react';
import { levels, type LevelSummary } from '@/levels';
import { useCaseLog, useProgress } from '../progress/ProgressProvider';
import type { ClosedInfo } from '../progress/progress-store';
import {
  latestReset,
  summarize,
  type IncidentSummary,
} from '../progress/case-log';
import { acts, isUnlocked } from '@/levels/progression';
import { Button } from '@/components/ui/button';
import CaseRecord from '../lesson/CaseRecord';
import { bugId, folio, formatDay, formatTime } from '../format';

// Before progress loads, only Incident 01 is known to be open; states stay blank until then.
const NO_PROGRESS: ReadonlySet<string> = new Set();

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

function activity({ runs, hintTiers }: IncidentSummary) {
  const parts = [];
  if (runs > 0) parts.push(plural(runs, 'run'));
  if (hintTiers.length > 0) parts.push(plural(hintTiers.length, 'hint'));
  return parts.join(' · ');
}

/** The incident on the desk: the case header's folio, title and record, with Start or Continue. */
function DeskCase({
  level,
  summary,
  firstCase,
}: {
  level: LevelSummary;
  summary: IncidentSummary;
  firstCase: boolean;
}) {
  const worked = summary.runs > 0 || summary.hintTiers.length > 0;
  // Only someone who has closed nothing and not started here sees the loop spelled out.
  const newHere = firstCase && !worked;
  return (
    <section className="desk-case" aria-labelledby="desk-case-title">
      <div className="case-index">
        <span>Incident</span>
        <strong>{folio(level.number)}</strong>
      </div>
      <div className="desk-case-body">
        <div className="desk-case-head">
          <div>
            <h2 id="desk-case-title">{level.title}</h2>
            <p className="desk-case-report">{level.symptom}</p>
            {newHere && (
              <p className="case-orientation">
                <span>New here?</span> Reproduce the report in the live route,
                repair the source files in your editor, then run the checks.
              </p>
            )}
          </div>
          <Button render={<Link href={`/level/${level.id}`} />}>
            {worked ? 'Continue' : 'Start'} Incident {folio(level.number)}
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
        <CaseRecord
          level={level}
          isComplete={false}
          isSaved={false}
          summary={summary}
        />
      </div>
    </section>
  );
}

function SeasonRecord({
  closedInfo,
  summaries,
}: {
  closedInfo: ReadonlyMap<string, ClosedInfo>;
  summaries: ReadonlyMap<string, IncidentSummary>;
}) {
  const times = [...closedInfo.values()].map((info) => info.at);
  const first = times.length > 0 ? formatDay(Math.min(...times)) : null;
  const last = times.length > 0 ? formatDay(Math.max(...times)) : null;
  let runs = 0;
  let hints = 0;
  for (const summary of summaries.values()) {
    runs += summary.runs;
    hints += summary.hintTiers.length;
  }
  return (
    <section className="season-record" aria-labelledby="season-record-title">
      <h2 id="season-record-title">
        <Check aria-hidden="true" />
        Season 2 complete
      </h2>
      <p>
        All thirteen incidents closed. Revisit any incident to check your
        current source.
      </p>
      {(first || runs > 0) && (
        <dl className="case-record">
          {first && (
            <div>
              <dt>Closed</dt>
              <dd>{first === last ? first : `${first} – ${last}`}</dd>
            </div>
          )}
          {runs > 0 && (
            <>
              <div>
                <dt>Runs</dt>
                <dd className="mono">{runs}</dd>
              </div>
              <div>
                <dt>Hints opened</dt>
                <dd className="mono">{hints}</dd>
              </div>
            </>
          )}
        </dl>
      )}
    </section>
  );
}

export default function LevelMap() {
  const router = useRouter();
  const { completed, saved, closedInfo } = useProgress();
  const caseLog = useCaseLog();
  const summaries = new Map(
    levels.map((level) => [level.id, summarize(caseLog.logs.get(level.id))]),
  );
  const summaryOf = (id: string) => summaries.get(id) ?? summarize(undefined);
  const next =
    completed &&
    levels.find(
      (level) => !completed.has(level.id) && isUnlocked(level, completed),
    );
  // A reset clears every close, so the note stands until the next one.
  const resetAt = completed?.size === 0 ? latestReset(caseLog) : null;

  // The title is the row's link; the rest of the row is a wider pointer target for it.
  function openRow(event: MouseEvent<HTMLTableRowElement>, href: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
    if (event.shiftKey || event.altKey) return;
    if ((event.target as Element).closest('a')) return;
    if (window.getSelection()?.isCollapsed === false) return;
    router.push(href);
  }

  return (
    <main id="main-content" tabIndex={-1} className="incident-register">
      <header className="register-heading">
        <h1>Incident register</h1>
        <p>
          Season 2 / Next.js App Router. Thirteen incidents in real source code.
        </p>
        {resetAt !== null && (
          <p className="register-reset">
            <RotateCcw aria-hidden="true" />
            Progress reset {formatDay(resetAt)} at {formatTime(resetAt)}. Closes
            were cleared; case logs were kept.
          </p>
        )}
      </header>
      {completed === null ? (
        <p className="register-loading" role="status">
          Loading progress…
        </p>
      ) : next ? (
        <DeskCase
          level={next}
          summary={summaryOf(next.id)}
          firstCase={completed.size === 0}
        />
      ) : (
        <SeasonRecord closedInfo={closedInfo} summaries={summaries} />
      )}
      <div className="docket">
        {acts.map((act, index) => {
          const actLevels = levels.filter(
            (level) => level.number >= act.from && level.number <= act.to,
          );
          const headingId = `docket-act-${index + 1}`;
          return (
            <section
              className="docket-act"
              key={act.from}
              aria-labelledby={headingId}
            >
              <div className="docket-act-head">
                <h2 id={headingId}>
                  <span className="docket-act-number">
                    Act {folio(index + 1)}
                    <span className="sr-only">:</span>
                  </span>{' '}
                  {act.name}
                </h2>
                {completed && (
                  <p>
                    {
                      actLevels.filter((level) => completed.has(level.id))
                        .length
                    }{' '}
                    of {actLevels.length} closed
                  </p>
                )}
              </div>
              {/* Explicit roles keep the table readable when narrow widths restack its rows. */}
              <table
                className="docket-table"
                role="table"
                aria-labelledby={headingId}
              >
                <thead role="rowgroup">
                  <tr role="row">
                    <th role="columnheader" scope="col" className="docket-case">
                      Case
                    </th>
                    <th
                      role="columnheader"
                      scope="col"
                      className="docket-incident"
                    >
                      Incident
                    </th>
                    <th
                      role="columnheader"
                      scope="col"
                      className="docket-concept"
                    >
                      Concept
                    </th>
                    <th
                      role="columnheader"
                      scope="col"
                      className="docket-severity"
                    >
                      Severity
                    </th>
                    <th
                      role="columnheader"
                      scope="col"
                      className="docket-activity"
                    >
                      Activity
                    </th>
                    <th
                      role="columnheader"
                      scope="col"
                      className="docket-status"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  {actLevels.map((level) => {
                    const unlocked = isUnlocked(
                      level,
                      completed ?? NO_PROGRESS,
                    );
                    const done = completed?.has(level.id) ?? false;
                    const href = `/level/${level.id}`;
                    const closed = closedInfo.get(level.id);
                    const worked = activity(summaryOf(level.id));
                    const state = done
                      ? 'closed'
                      : completed === null
                        ? undefined
                        : unlocked
                          ? 'open'
                          : 'locked';
                    return (
                      <tr
                        role="row"
                        key={level.id}
                        data-state={state}
                        onClick={
                          unlocked ? (event) => openRow(event, href) : undefined
                        }
                      >
                        <td role="cell" className="docket-case mono">
                          {bugId(level.number)}
                        </td>
                        <th
                          role="rowheader"
                          scope="row"
                          className="docket-incident"
                        >
                          {unlocked ? (
                            <Link href={href}>{level.title}</Link>
                          ) : (
                            level.title
                          )}
                          <span className="docket-concept-inline">
                            {level.concept}
                          </span>
                        </th>
                        <td role="cell" className="docket-concept">
                          {level.concept}
                        </td>
                        <td role="cell" className="docket-severity">
                          {level.severity}
                        </td>
                        <td role="cell" className="docket-activity mono">
                          {completed === null ? null : worked ? (
                            worked
                          ) : (
                            <>
                              <span aria-hidden="true">—</span>
                              <span className="sr-only">No activity yet</span>
                            </>
                          )}
                        </td>
                        <td role="cell" className="docket-status">
                          {state === 'closed' ? (
                            <>
                              <span className="state-closed">
                                <Check aria-hidden="true" />
                                {closed
                                  ? `Closed ${formatDay(closed.at)}`
                                  : 'Closed'}
                              </span>
                              {!saved.has(level.id) && (
                                <span className="docket-qualifier">
                                  Not saved yet
                                </span>
                              )}
                            </>
                          ) : state === 'open' ? (
                            <span className="state-open">Open</span>
                          ) : state === 'locked' ? (
                            <span className="docket-locked">
                              <LockKeyhole aria-hidden="true" />
                              Opens after {folio(level.number - 1)}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
    </main>
  );
}
