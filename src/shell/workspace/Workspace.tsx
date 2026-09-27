'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
} from 'lucide-react';
import { levels } from '@/levels';
import { acts, isUnlocked } from '@/levels/progression';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetTrigger,
  SheetPopup,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetPanel,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from '@/components/ui/alert-dialog';
import { useProgress } from '../progress/ProgressProvider';
import { folio } from '../format';
import IncidentNav from './IncidentNav';

export default function Workspace({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  function toggleSidebar() {
    setSidebarCollapsed((collapsed) => !collapsed);
  }
  const {
    completed,
    saved,
    resetProgress,
    loadError,
    saveError,
    resetError,
    retryLoad,
    retrySave,
  } = useProgress();
  // The amber mark is the next open incident: the case currently on the desk.
  const nextOpen =
    completed &&
    levels.find(
      (level) => !completed.has(level.id) && isUnlocked(level, completed),
    );
  return (
    <TooltipProvider>
      <div
        className={`game-shell dark${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}
      >
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <header className="desk-header">
          <div className="desk-brand-group">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger
                className="mobile-nav-toggle"
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open incident navigation"
                  />
                }
              >
                <Menu aria-hidden="true" />
              </SheetTrigger>
              <SheetPopup side="left" className="desk-overlay dark desk-sheet">
                <SheetHeader>
                  <SheetTitle>Incident register</SheetTitle>
                  <SheetDescription>Season 2 / Next.js</SheetDescription>
                </SheetHeader>
                <SheetPanel>
                  <IncidentNav onNavigate={() => setNavOpen(false)} />
                </SheetPanel>
              </SheetPopup>
            </Sheet>
            <Link href="/" className="desk-brand">
              <Image
                className="desk-brand-mark"
                src="/bugbound-icon.svg"
                width={32}
                height={32}
                alt=""
                aria-hidden="true"
                loading="eager"
                unoptimized
              />
              <span>
                Bugbound<span className="brand-season">Season 2</span>
              </span>
            </Link>
          </div>
          <div className="desk-progress">
            {completed !== null && (
              <span className="progress-strip" aria-hidden="true">
                {acts.map((act) => (
                  <span key={act.from} className="progress-act">
                    {levels
                      .filter(
                        (level) =>
                          level.number >= act.from && level.number <= act.to,
                      )
                      .map((level) => (
                        <span
                          key={level.id}
                          data-state={
                            completed.has(level.id)
                              ? 'closed'
                              : level.id === nextOpen?.id
                                ? 'current'
                                : undefined
                          }
                        />
                      ))}
                  </span>
                ))}
              </span>
            )}
            <span className="progress-count">
              {completed === null ? (
                'Loading progress…'
              ) : (
                <>
                  <strong>{folio(completed.size)}</strong> / {levels.length}{' '}
                  closed
                  {completed.size > saved.size && (
                    <span> · {completed.size - saved.size} not saved yet</span>
                  )}
                </>
              )}
            </span>
          </div>
        </header>
        <aside
          className="desktop-notice"
          aria-labelledby="desktop-notice-title"
        >
          <Monitor size={22} aria-hidden="true" />
          <div>
            <h2 id="desktop-notice-title">
              Use a desktop to work on the incidents.
            </h2>
            <p>
              Bugbound is a desktop-first project. To fix bugs, edit the actual
              source files in a local code editor, let Next.js recompile the
              app, then run the checks in a desktop browser.
            </p>
            <p className="desktop-notice-browse">
              You can still read the register and any open incident here.
            </p>
          </div>
        </aside>
        <div className="desk-body">
          <aside className="desk-sidebar" id="desktop-incident-sidebar">
            <IncidentNav
              groupsId="desktop-incident-groups"
              showIndex={sidebarCollapsed}
              collapseControl={
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          sidebarCollapsed
                            ? 'Expand incident sidebar'
                            : 'Collapse incident sidebar'
                        }
                        aria-expanded={!sidebarCollapsed}
                        aria-controls="desktop-incident-groups"
                        onClick={toggleSidebar}
                      />
                    }
                  >
                    {sidebarCollapsed ? (
                      <PanelLeftOpen aria-hidden="true" />
                    ) : (
                      <PanelLeftClose aria-hidden="true" />
                    )}
                  </TooltipTrigger>
                  <TooltipPopup className="desk-overlay dark">
                    {sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  </TooltipPopup>
                </Tooltip>
              }
            />
            <div className="sidebar-end">
              <span>Next.js App Router</span>
              <span>13 incidents / 3 acts</span>
            </div>
          </aside>
          <div className="desk-content">
            {(loadError || saveError || resetError) && (
              <div className="storage-recovery" role="alert">
                {loadError && (
                  <div>
                    <p>
                      Saved progress could not be read. Incidents you closed
                      before may show as locked.
                    </p>
                    <Button variant="outline" onClick={retryLoad}>
                      <RotateCcw aria-hidden="true" /> Retry loading
                    </Button>
                  </div>
                )}
                {saveError && (
                  <div>
                    <p>Closed this visit, but not saved in this browser.</p>
                    <Button variant="outline" onClick={retrySave}>
                      <RotateCcw aria-hidden="true" /> Retry saving
                    </Button>
                  </div>
                )}
                {resetError && (
                  <div>
                    <p>
                      Progress was not reset. Your closed incidents are
                      unchanged.
                    </p>
                    <Button variant="outline" onClick={resetProgress}>
                      <RotateCcw aria-hidden="true" /> Retry reset
                    </Button>
                  </div>
                )}
              </div>
            )}
            {children}
            <footer className="desk-footer">
              <span>
                Bugbound / Season 2{' '}
                <span className="footer-credit">
                  / Incidents &amp; bugs by Claude
                </span>
              </span>
              <AlertDialog>
                <AlertDialogTrigger
                  render={<Button variant="ghost" size="sm" />}
                >
                  <RotateCcw aria-hidden="true" /> Reset progress
                </AlertDialogTrigger>
                <AlertDialogPopup
                  className="desk-overlay dark desk-dialog"
                  bottomStickOnMobile={false}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Closed incidents will reopen and every incident after the
                      first will lock again. Active checks will be cancelled.
                      Your source files will not change.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogClose render={<Button variant="outline" />}>
                      Keep progress
                    </AlertDialogClose>
                    <AlertDialogClose
                      render={<Button variant="destructive" />}
                      onClick={resetProgress}
                    >
                      Reset progress
                    </AlertDialogClose>
                  </AlertDialogFooter>
                </AlertDialogPopup>
              </AlertDialog>
            </footer>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
