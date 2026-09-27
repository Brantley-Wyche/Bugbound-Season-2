'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function LabDataReset({
  disabled,
  onReset,
}: {
  disabled: boolean;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef<AbortController | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => () => active.current?.abort(), []);

  async function reset() {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setPending(true);
    setError(null);
    try {
      const response = await fetch('/api/practice/fixtures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelId: '13-launch-day' }),
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(10000),
        ]),
      });
      if (!response.ok)
        throw new Error(
          'Lab data could not be reset. Check the local dev server and retry.',
        );
      controller.signal.throwIfAborted();
      setOpen(false);
      onReset();
    } catch {
      if (!controller.signal.aborted)
        setError(
          'Lab reset could not be confirmed. Check the local dev server, stop other lab activity, and retry.',
        );
    } finally {
      active.current = null;
      if (!controller.signal.aborted) setPending(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) setOpen(value);
      }}
    >
      <AlertDialogTrigger
        render={<Button variant="outline" disabled={disabled} />}
      >
        <RotateCcw aria-hidden="true" />
        Reset lab data
      </AlertDialogTrigger>
      <AlertDialogPopup
        className="desk-overlay desk-dialog dark"
        initialFocus={cancelRef}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Launch Day data?</AlertDialogTitle>
          <AlertDialogDescription>
            This restores mock stock and clears mock orders across all tabs.
            Stop checks in other tabs first. Source files and saved progress
            stay unchanged.
          </AlertDialogDescription>
          {error && <p role="alert">{error}</p>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose
            render={
              <Button ref={cancelRef} variant="outline" disabled={pending} />
            }
          >
            Cancel
          </AlertDialogClose>
          <Button onClick={reset} disabled={pending}>
            {pending
              ? 'Resetting…'
              : error
                ? 'Retry lab reset'
                : 'Reset lab data'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
