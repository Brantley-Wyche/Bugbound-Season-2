'use client';

import { useRef } from 'react';
import hints from '@/levels/hints.json';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCaseLog } from '../progress/ProgressProvider';

export const TIER_LABELS = [
  'Gentle nudge',
  'Closer look',
  'Basically the answer',
];
function decode(b64: string) {
  return new TextDecoder().decode(
    Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)),
  );
}
export default function HintBox({ levelId }: { levelId: string }) {
  const encoded: string[] = (hints as Record<string, string[]>)[levelId] ?? [];
  const { recordHint } = useCaseLog();
  const open = useRef<unknown[]>([]);
  return (
    <section className="case-hints" aria-labelledby="hints-title">
      <div className="section-heading">
        <h2 id="hints-title">Hints</h2>
        <span>Optional guidance</span>
      </div>
      <Accordion
        multiple
        onValueChange={(value) => {
          // The case log records which tier opened, never the hint itself.
          for (const item of value)
            if (!open.current.includes(item))
              recordHint(levelId, Number(String(item).replace('hint-', '')));
          open.current = [...value];
        }}
      >
        {encoded.map((b64, index) => (
          <AccordionItem value={`hint-${index}`} key={index}>
            <AccordionTrigger>
              <span className="hint-label">
                <span>0{index + 1}</span>
                {TIER_LABELS[index]}
              </span>
            </AccordionTrigger>
            <AccordionContent>{decode(b64)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
