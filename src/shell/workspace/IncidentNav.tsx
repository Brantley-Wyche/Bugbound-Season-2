'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, LockKeyhole } from 'lucide-react';
import { type ReactNode } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from '@/components/ui/accordion';
import { levels } from '@/levels';
import { useProgress } from '../progress/ProgressProvider';
import { acts, isUnlocked } from '@/levels/progression';

export default function IncidentNav({
  onNavigate,
  collapseControl,
  groupsId,
}: {
  onNavigate?: () => void;
  collapseControl?: ReactNode;
  groupsId?: string;
}) {
  const pathname = usePathname();
  const { completed, saved } = useProgress();
  const activeLevel = levels.find((level) => pathname === `/level/${level.id}`);
  const activeAct = acts.find(
    (act) =>
      activeLevel &&
      activeLevel.number >= act.from &&
      activeLevel.number <= act.to,
  );
  return (
    <nav className="incident-nav" aria-label="Incidents">
      <div className="nav-register-row">
        <h2 className="nav-register-heading">
          <Link
            href="/"
            className="register-link"
            aria-current={pathname === '/' ? 'page' : undefined}
            onClick={onNavigate}
          >
            <span>Incident register</span>
          </Link>
        </h2>
        {collapseControl}
      </div>
      <Accordion
        key={pathname}
        id={groupsId}
        multiple
        defaultValue={
          activeAct ? [activeAct.from] : acts.map((act) => act.from)
        }
        className="nav-groups"
      >
        {acts.map((act) => (
          <AccordionItem key={act.from} value={act.from}>
            <AccordionTrigger>{act.name}</AccordionTrigger>
            <AccordionPanel>
              <ol>
                {levels
                  .filter(
                    (level) =>
                      level.number >= act.from && level.number <= act.to,
                  )
                  .map((level) => {
                    const unlocked =
                      completed !== null && isUnlocked(level, completed);
                    const done = completed?.has(level.id);
                    const content = (
                      <>
                        <span className="nav-number">
                          {String(level.number).padStart(2, '0')}
                        </span>
                        <span className="nav-title">{level.title}</span>
                        {done ? (
                          <Check
                            size={14}
                            aria-label={
                              saved.has(level.id)
                                ? 'Completion saved'
                                : 'Completed this visit, not saved'
                            }
                          />
                        ) : !unlocked ? (
                          <LockKeyhole size={12} aria-label="Locked" />
                        ) : null}
                      </>
                    );
                    return (
                      <li key={level.id}>
                        {unlocked ? (
                          <Link
                            href={`/level/${level.id}`}
                            aria-current={
                              pathname === `/level/${level.id}`
                                ? 'page'
                                : undefined
                            }
                            onClick={onNavigate}
                          >
                            {content}
                          </Link>
                        ) : (
                          <span className="nav-locked" aria-disabled="true">
                            {content}
                          </span>
                        )}
                      </li>
                    );
                  })}
              </ol>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </nav>
  );
}
