import { Check } from 'lucide-react';
import type { LevelSummary } from '@/levels';
import type { ClosedInfo } from '../progress/progress-store';
import type { IncidentSummary } from '../progress/case-log';
import { bugId, folio, formatDay, formatTime } from '../format';

/** The ruled record row for one incident: its file, its state and the learner's work on it. */
export default function CaseRecord({
  level,
  isComplete,
  isSaved,
  closed,
  summary,
}: {
  level: Pick<LevelSummary, 'number' | 'concept' | 'severity'>;
  isComplete: boolean;
  isSaved: boolean;
  closed?: ClosedInfo;
  summary: IncidentSummary;
}) {
  const { runs, hintTiers, lastWorked } = summary;
  return (
    <dl className="case-record">
      <div>
        <dt>Case</dt>
        <dd className="mono">{bugId(level.number)}</dd>
      </div>
      <div>
        <dt>Concept</dt>
        <dd>{level.concept}</dd>
      </div>
      <div>
        <dt>Severity</dt>
        <dd>{level.severity}</dd>
      </div>
      <div>
        <dt>Status</dt>
        {isComplete ? (
          <dd className="state-closed">
            <Check aria-hidden="true" />
            {closed ? `Closed ${formatDay(closed.at)}` : 'Closed'}
            {!isSaved && (
              <span className="state-qualifier"> · not saved yet</span>
            )}
          </dd>
        ) : (
          <dd className="state-open">Open</dd>
        )}
      </div>
      {closed && (
        <div>
          <dt>Closing run</dt>
          <dd className="mono">
            Run {closed.run} · {formatTime(closed.at)}
          </dd>
        </div>
      )}
      {runs > 0 && (
        <div>
          <dt>Runs</dt>
          <dd className="mono">{runs}</dd>
        </div>
      )}
      {hintTiers.length > 0 && (
        <div>
          <dt>Hints opened</dt>
          <dd className="mono">
            {hintTiers.map((tier) => folio(tier + 1)).join(' ')}
          </dd>
        </div>
      )}
      {lastWorked !== null && (
        <div>
          <dt>Last worked</dt>
          <dd>
            {formatDay(lastWorked)} {formatTime(lastWorked)}
          </dd>
        </div>
      )}
    </dl>
  );
}
