'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, RotateCw, BookOpen, Check } from 'lucide-react';
import { levels } from '@/levels';
import type { LevelManifest } from '../types';
import Prose from './Prose';
import ChecksRunner from '../checks/ChecksRunner';
import HintBox from './HintBox';
import CaseLog from './CaseLog';
import SourceFiles from './SourceFiles';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipPopup } from '@/components/ui/tooltip';
import { useCaseLog, useProgress } from '../progress/ProgressProvider';
import type { ClosedInfo, RunToken } from '../progress/progress-store';
import { bugId, folio, formatDay, formatTime } from '../format';

export default function LevelPage({
  level,
  isComplete,
  isSaved,
  onComplete,
}: {
  level: LevelManifest;
  isComplete: boolean;
  isSaved: boolean;
  onComplete: (token: RunToken, info: ClosedInfo) => void;
}) {
  const [frameKey, setFrameKey] = useState(0);
  const { completed, closedInfo } = useProgress();
  const { logs, recordOpened } = useCaseLog();
  const closed = closedInfo.get(level.id);
  const next = levels.find((item) => item.number === level.number + 1);
  // Only someone with nothing closed yet sees the loop spelled out.
  const firstCase = !isComplete && completed !== null && completed.size === 0;
  const log = logs.get(level.id);
  const hintTiers = [
    ...new Set(
      log?.events.flatMap((event) =>
        event.type === 'hint' ? [event.tier] : [],
      ),
    ),
  ].sort();
  const lastWorked = Math.max(
    0,
    ...(log?.events ?? [])
      .filter((event) => event.type !== 'opened')
      .map((event) => event.at),
  );

  // The case log's first entry: this incident was opened.
  useEffect(() => {
    recordOpened(level.id);
  }, [level.id, recordOpened]);
  return (
    <main id="main-content" tabIndex={-1} className="case-workspace">
      <header className="case-header">
        <div className="case-index">
          <span>Incident</span>
          <strong>{folio(level.number)}</strong>
        </div>
        <div className="case-heading">
          <h1>{level.title}</h1>
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
            {log && log.runs > 0 && (
              <div>
                <dt>Runs</dt>
                <dd className="mono">{log.runs}</dd>
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
            {lastWorked > 0 && (
              <div>
                <dt>Last worked</dt>
                <dd>
                  {formatDay(lastWorked)} {formatTime(lastWorked)}
                </dd>
              </div>
            )}
          </dl>
          {firstCase && (
            <p className="case-orientation">
              <span>New here?</span> Reproduce the report in the live route,
              repair the source files in your editor, then run the checks.
            </p>
          )}
        </div>
      </header>
      <nav className="case-jumps" aria-label="Investigation sections">
        <a href="#report-title">Report</a>
        <a href="#checks-title">Evidence</a>
        <a href="#concept-title">
          <BookOpen size={14} aria-hidden="true" />
          Concept
        </a>
        <a href="#hints-title">Hints</a>
      </nav>
      <div className="case-columns">
        <div className="investigation-column">
          <section className="incident-report" aria-labelledby="report-title">
            <div className="section-heading">
              <h2 id="report-title">Incident report</h2>
            </div>
            <p className="incident-symptom">{level.symptom}</p>
            <SourceFiles files={level.files} vague={level.vague} />
          </section>
          <ChecksRunner
            level={level}
            isComplete={isComplete}
            isSaved={isSaved}
            closedInfo={closed}
            next={next}
            onAllPass={onComplete}
            onFixtureReset={() => setFrameKey((key) => key + 1)}
          >
            <section className="route-preview" aria-label="Live route preview">
              <div className="preview-address">
                <span className="preview-label">Live route</span>
                <code translate="no">{level.route}</code>
                <div className="preview-actions">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          render={
                            <a
                              href={level.route}
                              target="_blank"
                              rel="noreferrer"
                            />
                          }
                          aria-label="Open preview in new tab"
                        />
                      }
                    >
                      <ExternalLink aria-hidden="true" />
                    </TooltipTrigger>
                    <TooltipPopup className="desk-overlay dark">
                      Open preview in new tab
                    </TooltipPopup>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setFrameKey((key) => key + 1)}
                          aria-label="Reload preview"
                        />
                      }
                    >
                      <RotateCw aria-hidden="true" />
                    </TooltipTrigger>
                    <TooltipPopup className="desk-overlay dark">
                      Reload preview
                    </TooltipPopup>
                  </Tooltip>
                </div>
              </div>
              <iframe
                key={frameKey}
                src={level.route}
                title={`Live preview of ${level.route}`}
              />
            </section>
          </ChecksRunner>
          <CaseLog levelId={level.id} number={level.number} />
          <HintBox levelId={level.id} />
        </div>
        <aside className="concept-column" aria-labelledby="concept-title">
          <h2 id="concept-title">{level.concept}</h2>
          <div className="reference-label">
            <BookOpen size={17} aria-hidden="true" />
            <span>Concept reference</span>
          </div>
          <Prose paragraphs={level.lesson} />
        </aside>
      </div>
    </main>
  );
}
