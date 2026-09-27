'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCaseLog } from '../progress/ProgressProvider';
import { entriesFor, type LogEntry } from '../progress/case-log';
import { bugId, folio, formatDay, formatTime } from '../format';
import { TIER_LABELS } from './HintBox';

const RECENT = 6;

export default function CaseLog({
  levelId,
  number,
}: {
  levelId: string;
  number: number;
}) {
  const snapshot = useCaseLog();
  const [expanded, setExpanded] = useState(false);
  const entries = entriesFor(snapshot, levelId);
  if (entries.length === 0) return null;
  const shown = expanded ? entries : entries.slice(0, RECENT);
  const days: { label: string; entries: LogEntry[] }[] = [];
  for (const entry of shown) {
    const day = formatDay(entry.at);
    const label = day.charAt(0).toUpperCase() + day.slice(1);
    if (days.at(-1)?.label === label) days.at(-1)?.entries.push(entry);
    else days.push({ label, entries: [entry] });
  }
  const onlyOpened = entries.every((entry) => entry.type === 'opened');
  return (
    <section className="case-log" aria-labelledby="case-log-title">
      <div className="section-heading">
        <h2 id="case-log-title">Case log</h2>
        <span>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} ·{' '}
          {snapshot.writeError
            ? 'not saved in this browser'
            : 'kept in this browser'}
        </span>
      </div>
      {days.map((day) => (
        <div key={day.label} className="case-log-day">
          <p className="case-log-date">{day.label}</p>
          <ol>
            {day.entries.map((entry, index) => (
              <li key={`${entry.type}-${entry.at}-${index}`}>
                <span className="case-log-time">{formatTime(entry.at)}</span>
                <span className="case-log-event" data-kind={entry.type}>
                  {eventLabel(entry)}
                </span>
                <span className="case-log-detail">
                  {eventDetail(entry, number)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ))}
      {onlyOpened && (
        <p className="case-log-note">
          Your runs and the hint tiers you open are logged here as you work.
          Hint text is never recorded.
        </p>
      )}
      {entries.length > RECENT && (
        <Button
          variant="outline"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? (
            <ChevronUp aria-hidden="true" />
          ) : (
            <ChevronDown aria-hidden="true" />
          )}
          {expanded
            ? 'Show recent entries'
            : `Show all ${entries.length} entries`}
        </Button>
      )}
    </section>
  );
}

function eventLabel(entry: LogEntry) {
  switch (entry.type) {
    case 'opened':
      return 'Opened';
    case 'run':
      return `Run ${entry.run}`;
    case 'hint':
      return `Hint ${folio(entry.tier + 1)}`;
    case 'reset':
      return 'Reset';
  }
}

function eventDetail(entry: LogEntry, number: number) {
  switch (entry.type) {
    case 'opened':
      return (
        <>
          First visit to <span className="mono">{bugId(number)}</span>
        </>
      );
    case 'hint':
      return `${TIER_LABELS[entry.tier]} opened`;
    case 'reset':
      return 'Progress reset. Closes were cleared; this log was kept.';
    case 'run':
      if (entry.status === 'cancelled')
        return <span className="result-muted">Cancelled</span>;
      if (entry.status === 'error')
        return <span className="result-fail">Could not finish</span>;
      return (
        <span
          className={entry.status === 'passed' ? 'result-pass' : 'result-fail'}
        >
          {entry.passed} of {entry.total} passed
          {entry.closed && (
            <>
              {' '}
              · Closed <Check aria-hidden="true" />
            </>
          )}
        </span>
      );
  }
}
