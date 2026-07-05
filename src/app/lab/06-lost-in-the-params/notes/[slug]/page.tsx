import Link from 'next/link';
import { getNote } from '../../data';

export default function NotePage({ params }: { params: { slug: string } }) {
  const note = getNote(params.slug);

  if (!note) {
    return (
      <div className="lv-card">
        <h1 className="lv-heading" data-testid="note-missing">
          Note not found
        </h1>
        <p className="lv-muted">No field note lives at this address.</p>
        <Link href="/lab/06-lost-in-the-params">← All notes</Link>
      </div>
    );
  }

  return (
    <article className="lv-card" style={{ maxWidth: 560 }}>
      <span className="lv-tag">{note.season}</span>
      <h1 className="lv-heading" data-testid="note-title">
        {note.title}
      </h1>
      <p data-testid="note-body">{note.body}</p>
      <Link href="/lab/06-lost-in-the-params">← All notes</Link>
    </article>
  );
}
