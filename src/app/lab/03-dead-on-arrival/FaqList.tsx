'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Do you ship internationally?',
    a: 'Yes — anywhere the ferry goes, and most places it doesn’t. Allow 5–10 business days.',
  },
  {
    q: 'Can I change my subscription roast?',
    a: 'Any time before the 25th of the month, from your account page. Changes apply to the next bag.',
  },
  {
    q: 'My bag arrived torn. What now?',
    a: 'Email a photo to care@driftwood.example and we’ll reship the same day, no questions asked.',
  },
];

export default function FaqList({ onOpen }: { onOpen?: (question: string) => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(i: number) {
    const next = openIndex === i ? null : i;
    setOpenIndex(next);
    if (next !== null) onOpen?.(FAQS[i].q);
  }

  return (
    <ul className="lv-list" data-testid="faq">
      {FAQS.map((item, i) => (
        <li key={item.q}>
          <button
            className="lv-btn"
            style={{ width: '100%', textAlign: 'left' }}
            data-testid="faq-question"
            onClick={() => toggle(i)}
          >
            {item.q}
          </button>
          {openIndex === i && (
            <p className="lv-muted" data-testid="faq-answer" style={{ padding: '8px 4px 2px' }}>
              {item.a}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
