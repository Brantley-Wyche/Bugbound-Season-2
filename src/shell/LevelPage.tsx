'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { levels } from '@/levels';
import type { LevelManifest, Severity } from './types';
import Prose from './Prose';
import ChecksRunner from './ChecksRunner';
import HintBox from './HintBox';
import PanelTitle from './PanelTitle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const SEVERITY_BADGE: Record<Severity, string> = {
  Low: 'border-border-strong bg-panel-2 text-muted-foreground',
  Medium: 'border-warn/35 bg-warn/12 text-warn',
  High: 'border-sev-high/35 bg-sev-high/12 text-sev-high',
  Critical: 'border-err/35 bg-err/10 text-err',
};

const BADGE_BASE = 'font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em]';

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
    <main className="pt-7">
      <div className="mb-6 flex flex-col gap-2.5">
        <button
          className="w-fit cursor-pointer font-mono text-xs tracking-[0.05em] text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => router.push('/')}
        >
          ← Back to the map
        </button>
        <div className="flex flex-wrap items-baseline gap-3.5">
          <span className="font-mono text-[13px] tracking-[0.1em] text-muted-foreground">
            LVL {String(level.number).padStart(2, '0')}
          </span>
          <h1 className="text-[29px] font-semibold tracking-[-0.02em]">{level.title}</h1>
          <Badge
            variant="outline"
            className={cn(BADGE_BASE, 'border-info/30 bg-info/10 text-info')}
          >
            {level.concept}
          </Badge>
          <Badge variant="outline" className={cn(BADGE_BASE, SEVERITY_BADGE[level.severity])}>
            Severity: {level.severity}
          </Badge>
        </div>
      </div>

      {isComplete && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-ok/45 border-l-[3px] border-l-ok bg-ok/10 px-5 py-4">
          <div>
            <strong className="block font-mono text-[13.5px] font-bold uppercase tracking-[0.12em] text-ok">
              ✓ Incident resolved
            </strong>
            <span className="text-[13.5px] text-muted-foreground">
              {next
                ? 'The blocker is cleared — the next level is unlocked.'
                : 'That was the last one. Season 2 complete!'}
            </span>
          </div>
          {next ? (
            <Button
              className="font-mono text-xs font-semibold uppercase tracking-[0.08em]"
              onClick={() => router.push(`/level/${next.id}`)}
            >
              Next: {next.title} →
            </Button>
          ) : (
            <Button
              className="font-mono text-xs font-semibold uppercase tracking-[0.08em]"
              onClick={() => router.push('/')}
            >
              Back to the map 🏆
            </Button>
          )}
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="gap-4">
            <CardHeader>
              <PanelTitle color="info">Concept</PanelTitle>
            </CardHeader>
            <CardContent>
              <Prose paragraphs={level.lesson} />
            </CardContent>
          </Card>

          <Card className="gap-4 border-l-[3px] border-l-err">
            <CardHeader>
              <PanelTitle color="err">Bug report</PanelTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="flex items-center gap-2.5 font-mono text-[11.5px] tracking-[0.06em] text-muted-foreground">
                <span className="font-bold text-foreground">
                  BUG-{String(level.number).padStart(3, '0')}
                </span>
                <span>·</span>
                <span>SEV: {level.severity.toUpperCase()}</span>
                <span>·</span>
                <span className={isComplete ? 'text-ok' : 'text-err'}>
                  <span className={`status-dot ${isComplete ? 'ok' : 'err live'}`} />{' '}
                  {isComplete ? 'RESOLVED' : 'OPEN'}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed text-[#ecd2d0]">{level.symptom}</p>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
                  {level.vague ? 'The bug is somewhere in here:' : 'Where to look:'}
                </span>
                {level.files.map((f) => (
                  <code key={f} className="w-fit break-all whitespace-normal">
                    {f}
                  </code>
                ))}
              </div>
            </CardContent>
          </Card>

          <HintBox levelId={level.id} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card className="gap-4">
            <CardHeader>
              <PanelTitle color="info">Live preview</PanelTitle>
              <p className="text-[12.5px] text-muted-foreground">
                This is the real route, served by Next.js — the same one the checks hit.
                Interact with it and reproduce the report. Your edits hot-reload here.
              </p>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="overflow-hidden rounded-md border border-dashed border-border-strong bg-[#0d1117]">
                <iframe
                  key={frameKey}
                  className="block h-[440px] w-full border-0 bg-background"
                  src={level.route}
                  title={`Live preview of ${level.route}`}
                />
              </div>
              <div className="flex items-center justify-between gap-2.5">
                <span className="font-mono text-[11.5px] tracking-[0.04em] text-muted-foreground">
                  {level.route}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="font-mono text-[11px] font-semibold uppercase tracking-[0.07em]"
                  >
                    <a href={level.route} target="_blank" rel="noreferrer">
                      Open in tab ↗
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-mono text-[11px] font-semibold uppercase tracking-[0.07em]"
                    onClick={() => setFrameKey((k) => k + 1)}
                  >
                    ↻ Reload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <ChecksRunner level={level} onAllPass={onComplete} />
        </div>
      </div>
    </main>
  );
}
