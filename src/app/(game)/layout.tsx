'use client';

import Link from 'next/link';
import { levels } from '@/levels';
import { ProgressProvider, useProgress } from '@/shell/progress';
import { Badge } from '@/components/ui/badge';

function Chrome({ children }: { children: React.ReactNode }) {
  const { completed: loaded, resetProgress } = useProgress();
  const completed = loaded ?? new Set<string>();

  const handleReset = () => {
    if (window.confirm('Reset all progress? Every level will lock again.')) {
      resetProgress();
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-5 px-7 py-3.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-mono text-base font-bold tracking-[0.06em] text-foreground hover:no-underline"
          >
            <span className="text-lg" aria-hidden>
              🐛
            </span>
            <span>BUGBOUND</span>
            <Badge
              variant="outline"
              className="border-primary/40 font-mono text-[10.5px] font-semibold tracking-[0.12em] text-primary"
            >
              SEASON 2
            </Badge>
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="uptime-strip"
              title={`${completed.size} of ${levels.length} incidents resolved`}
            >
              {levels.map((l) => (
                <span key={l.id} className={`seg ${completed.has(l.id) ? 'done' : ''}`} />
              ))}
            </div>
            <span className="whitespace-nowrap font-mono text-xs tracking-[0.08em] text-muted-foreground tabular-nums">
              {completed.size}/{levels.length} RESOLVED
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-7 pb-16">
        {children}

        <footer className="mt-16 flex items-center justify-between gap-4 border-t pt-4 font-mono text-[11.5px] tracking-[0.05em] text-faint">
          <span>BUGBOUND · SEASON 2 · NEXT.JS APP ROUTER · LEVELS &amp; BUGS BY CLAUDE</span>
          <button
            onClick={handleReset}
            className="cursor-pointer underline underline-offset-4 transition-colors hover:text-err"
          >
            Reset progress
          </button>
        </footer>
      </div>
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
