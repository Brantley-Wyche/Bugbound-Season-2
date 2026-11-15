import { useCallback, useRef, useState } from 'react';

/**
 * Text for a live region that is announced again when the same message repeats.
 * React skips an identical update, and some screen readers skip a message identical
 * to the last one even after the region was emptied, so a repeat gets an unspoken
 * no-break space.
 */
export function useAnnouncement() {
  const [text, setText] = useState('');
  const last = useRef('');
  const announce = useCallback((message: string) => {
    const next = message === last.current ? `${message} ` : message;
    last.current = next;
    setText(next);
  }, []);
  return [text, announce] as const;
}
