'use client';

import Link from 'next/link';
import { levels } from '@/levels';
import { ProgressProvider, useProgress } from '@/shell/progress';

function Chrome({ children }: { children: React.ReactNode }) {
  const { completed: loaded, resetProgress } = useProgress();
  const completed = loaded ?? new Set<string>();

  const handleReset = () => {
    if (window.confirm('Reset all progress? Every level will lock again.')) {
      resetProgress();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <Link className="wordmark" href="/">
          <span className="bug">🐛</span>
          <span>BUGBOUND</span>
          <span className="season">SEASON 2</span>
        </Link>
        <div className="header-progress">
          <div
            className="uptime-strip"
            title={`${completed.size} of ${levels.length} incidents resolved`}
          >
            {levels.map((l) => (
              <span key={l.id} className={`seg ${completed.has(l.id) ? 'done' : ''}`} />
            ))}
          </div>
          <span className="label">
            {completed.size}/{levels.length} RESOLVED
          </span>
        </div>
      </header>

      {children}

      <footer className="app-footer">
        <span>BUGBOUND · SEASON 2 · NEXT.JS APP ROUTER · LEVELS &amp; BUGS BY CLAUDE</span>
        <button className="link-button" onClick={handleReset}>
          Reset progress
        </button>
      </footer>
    </div>
  );
}

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider>
      <Chrome>{children}</Chrome>
    </ProgressProvider>
  );
}
