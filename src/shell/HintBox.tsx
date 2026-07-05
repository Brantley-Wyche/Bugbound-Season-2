'use client';

import hints from '@/levels/hints.json';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import PanelTitle from './PanelTitle';

const TIER_LABELS = ['Gentle nudge', 'Closer look', 'Basically the answer'];

function decode(b64: string) {
  return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
}

export default function HintBox({ levelId }: { levelId: string }) {
  const encoded: string[] = (hints as Record<string, string[]>)[levelId] ?? [];

  return (
    <Card className="gap-4">
      <CardHeader>
        <PanelTitle color="warn">Hints</PanelTitle>
        <p className="text-[12.5px] text-muted-foreground">
          Hints are stored encoded so you can&apos;t spoil yourself by accident. Reveal them one
          at a time — a real debugging attempt first is worth more than all three combined.
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {encoded.map((b64, i) => (
            <AccordionItem value={`hint-${i}`} key={i}>
              <AccordionTrigger className="py-3 font-mono text-xs font-semibold uppercase tracking-[0.08em] hover:no-underline">
                <span className="flex w-full items-center justify-between pr-2">
                  <span>Hint {i + 1}</span>
                  <span className="text-[11px] font-medium normal-case tracking-[0.04em] text-faint">
                    {TIER_LABELS[i]}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-[#c3cfdc]">
                {decode(b64)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
