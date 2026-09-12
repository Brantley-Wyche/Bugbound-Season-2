'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ExternalLink,
  RotateCw,
  BookOpen,
  Check,
} from 'lucide-react';
import { levels } from '@/levels';
import type { LevelManifest } from '../types';
import Prose from './Prose';
import ChecksRunner from '../checks/ChecksRunner';
import HintBox from './HintBox';
import SourceFiles from './SourceFiles';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipPopup } from '@/components/ui/tooltip';
import type { RunToken } from '../progress/progress-store';

export default function LevelPage({
  level,
  isComplete,
  isSaved,
  onComplete,
}: {
  level: LevelManifest;
  isComplete: boolean;
  isSaved: boolean;
  onComplete: (token: RunToken) => void;
}) {
  const [frameKey, setFrameKey] = useState(0);
  const next = levels.find((item) => item.number === level.number + 1);
  return (
    <main id="main-content" tabIndex={-1} className="case-workspace">
      <header className="case-header">
        <div className="case-index">
          <span>Incident</span>
          <strong>{String(level.number).padStart(2, '0')}</strong>
        </div>
        <div className="case-heading">
          <h1>{level.title}</h1>
          <div className="case-meta">
            <span>{level.concept}</span>
            <span>Severity: {level.severity}</span>
            <span>
              {isComplete
                ? isSaved
                  ? 'Completion saved'
                  : 'Completed this visit, not saved'
                : 'Open investigation'}
            </span>
          </div>
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
      {isComplete && (
        <div className="completion-record">
          <Check size={18} aria-hidden="true" />
          <p>
            {isSaved ? 'Completion saved.' : 'Completed this visit, not saved.'}{' '}
            <span>
              Current source is verified only when you run the checks.
            </span>
          </p>
          <Button
            variant="outline"
            render={<Link href={next ? `/level/${next.id}` : '/'} />}
          >
            {next ? 'Next incident' : 'Season complete'}
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      )}
      <div className="case-columns">
        <div className="investigation-column">
          <section className="incident-report" aria-labelledby="report-title">
            <div className="section-heading">
              <h2 id="report-title">Incident report</h2>
              <span>BUG-{String(level.number).padStart(3, '0')}</span>
            </div>
            <p className="incident-symptom">{level.symptom}</p>
            <SourceFiles files={level.files} vague={level.vague} />
          </section>
          <ChecksRunner
            level={level}
            onAllPass={onComplete}
            onFixtureReset={() => setFrameKey((key) => key + 1)}
          >
            <section className="route-preview" aria-label="Live route preview">
              <div className="preview-address">
                <span className="preview-label">Live route</span>
                <code>{level.route}</code>
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
