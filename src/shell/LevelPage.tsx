'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { levels } from '@/levels';
import type { LevelManifest } from './types';
import Prose from './Prose';
import ChecksRunner from './ChecksRunner';
import HintBox from './HintBox';

export default function LevelPage({
  level,
  isComplete,
  onComplete,
}: {
  level: LevelManifest;
  isComplete: boolean;
  onComplete: () => void;
}) {
  const router = useRouter();
  const [frameKey, setFrameKey] = useState(0);
  const next = levels.find((l) => l.number === level.number + 1);

  return (
    <main>
      <div className="level-header">
        <button className="back-link" onClick={() => router.push('/')}>
          ← Back to the map
        </button>
        <div className="level-title-row">
          <span className="level-num">LVL {String(level.number).padStart(2, '0')}</span>
          <h1>{level.title}</h1>
          <span className="chip">{level.concept}</span>
          <span className={`chip severity-${level.severity}`}>Severity: {level.severity}</span>
        </div>
      </div>

      {isComplete && (
        <div className="success-banner">
          <div className="msg">
            <strong>✓ Incident resolved</strong>
            <span>
              {next
                ? 'The blocker is cleared — the next level is unlocked.'
                : 'That was the last one. Season 2 complete!'}
            </span>
          </div>
          {next ? (
            <button className="btn btn-primary" onClick={() => router.push(`/level/${next.id}`)}>
              Next: {next.title} →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => router.push('/')}>
              Back to the map 🏆
            </button>
          )}
        </div>
      )}

      <div className="level-layout">
        <div className="column">
          <div className="panel panel-concept">
            <h3>Concept</h3>
            <Prose paragraphs={level.lesson} />
          </div>

          <div className="panel bug-report">
            <h3>Bug report</h3>
            <div className="ticket-meta">
              <span className="ticket-id">BUG-{String(level.number).padStart(3, '0')}</span>
              <span>·</span>
              <span>SEV: {level.severity.toUpperCase()}</span>
              <span>·</span>
              <span className={isComplete ? 'ticket-resolved' : 'ticket-open'}>
                <span className={`status-dot ${isComplete ? 'ok' : 'err live'}`} />{' '}
                {isComplete ? 'RESOLVED' : 'OPEN'}
              </span>
            </div>
            <p className="symptom">{level.symptom}</p>
            <div className="file-list">
              <span className="hint-label">
                {level.vague ? 'The bug is somewhere in here:' : 'Where to look:'}
              </span>
              {level.files.map((f) => (
                <code key={f}>{f}</code>
              ))}
            </div>
          </div>

          <HintBox levelId={level.id} />
        </div>

        <div className="column">
          <div className="panel panel-demo demo-panel">
            <h3>Live preview</h3>
            <p className="demo-note">
              This is the real route, served by Next.js — the same one the checks hit. Interact
              with it and reproduce the report. Your edits hot-reload here.
            </p>
            <div className="preview-frame-wrap">
              <iframe
                key={frameKey}
                className="preview-frame"
                src={level.route}
                title={`Live preview of ${level.route}`}
              />
            </div>
            <div className="demo-toolbar">
              <span className="route-chip">{level.route}</span>
              <div className="actions">
                <a className="btn" href={level.route} target="_blank" rel="noreferrer">
                  Open in tab ↗
                </a>
                <button className="btn" onClick={() => setFrameKey((k) => k + 1)}>
                  ↻ Reload
                </button>
              </div>
            </div>
          </div>

          <ChecksRunner level={level} onAllPass={onComplete} />
        </div>
      </div>
    </main>
  );
}
