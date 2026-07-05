import Link from 'next/link';

export default function ConfLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="lv-nav" data-testid="lab-nav">
        <span className="brand">Driftwood Conf 2026</span>
        <Link href="/lab/01-vanishing-venue">Home</Link>
        <Link href="/lab/01-vanishing-venue/schedule">Schedule</Link>
        <Link href="/lab/01-vanishing-venue/venue">Venue</Link>
      </nav>
      {children}
    </div>
  );
}
