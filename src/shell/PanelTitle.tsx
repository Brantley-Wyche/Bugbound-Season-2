import { cn } from '@/lib/utils';

/** Section heading used across shell cards: mono, uppercase, with a colored
 *  index bar — the signature Bugbound panel header. */
export default function PanelTitle({
  color,
  children,
}: {
  color: 'info' | 'ok' | 'warn' | 'err';
  children: React.ReactNode;
}) {
  const bar = {
    info: 'bg-info',
    ok: 'bg-ok',
    warn: 'bg-warn',
    err: 'bg-err',
  }[color];

  return (
    <h3 className="flex items-center gap-2.5 font-mono text-[11.5px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
      <span className={cn('h-3.5 w-[3px] shrink-0 rounded-full', bar)} />
      {children}
    </h3>
  );
}
