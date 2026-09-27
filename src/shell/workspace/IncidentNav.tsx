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
import { Tooltip, TooltipTrigger, TooltipPopup } from '@/components/ui/tooltip';
import { levels } from '@/levels';
import { useProgress } from '../progress/ProgressProvider';
import { acts, isUnlocked } from '@/levels/progression';
import { folio } from '../format';

// Before progress loads, only Incident 01 is known to be open; show no lock marks yet.
const NO_PROGRESS: ReadonlySet<string> = new Set();

export default function IncidentNav({
  onNavigate,
  collapseControl,
  groupsId,
  showIndex = false,
}: {
  onNavigate?: () => void;
  collapseControl?: ReactNode;
  groupsId?: string;
  /** The numbered index the collapsed desktop rail shows instead of the groups. */
  showIndex?: boolean;
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
  const stateOf = (level: (typeof levels)[number]) =>
    completed?.has(level.id)
      ? saved.has(level.id)
        ? 'Closed'
        : 'Closed, not saved yet'
      : completed === null
        ? null
        : isUnlocked(level, completed)
          ? 'Open'
          : 'Locked';
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
                    const unlocked = isUnlocked(
                      level,
                      completed ?? NO_PROGRESS,
                    );
                    const done = completed?.has(level.id);
                    const content = (
                      <>
                        <span className="nav-number">
                          {folio(level.number)}
                        </span>
                        <span className="nav-title">{level.title}</span>
                        {done ? (
                          <Check
                            size={14}
                            role="img"
                            aria-label={stateOf(level) ?? 'Closed'}
                          />
                        ) : completed !== null && !unlocked ? (
                          <LockKeyhole
                            size={12}
                            role="img"
                            aria-label="Locked"
                          />
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
                          <span className="nav-locked">{content}</span>
                        )}
                      </li>
                    );
                  })}
              </ol>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      {showIndex && (
        <div className="nav-index">
          {acts.map((act) => (
            <ol key={act.from} aria-label={act.name}>
              {levels
                .filter(
                  (level) => level.number >= act.from && level.number <= act.to,
                )
                .map((level) => {
                  const state = stateOf(level);
                  const done = completed?.has(level.id);
                  const unlocked = isUnlocked(level, completed ?? NO_PROGRESS);
                  const label = `${folio(level.number)} ${level.title}${state ? `, ${state.toLowerCase()}` : ''}`;
                  return (
                    <li key={level.id}>
                      {unlocked ? (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Link
                                href={`/level/${level.id}`}
                                aria-label={label}
                                aria-current={
                                  pathname === `/level/${level.id}`
                                    ? 'page'
                                    : undefined
                                }
                                data-state={done ? 'closed' : 'open'}
                              />
                            }
                          >
                            {folio(level.number)}
                            {done && <Check aria-hidden="true" />}
                          </TooltipTrigger>
                          <TooltipPopup
                            side="right"
                            className="desk-overlay dark"
                          >
                            <span className="mono">{folio(level.number)}</span>{' '}
                            {level.title}
                            {state ? ` · ${state}` : ''}
                          </TooltipPopup>
                        </Tooltip>
                      ) : (
                        <span className="nav-index-locked">
                          {folio(level.number)}
                          <span className="sr-only">
                            {' '}
                            {level.title}
                            {state ? `, ${state.toLowerCase()}` : ''}
                          </span>
                        </span>
                      )}
                    </li>
                  );
                })}
            </ol>
          ))}
        </div>
      )}
    </nav>
  );
}
