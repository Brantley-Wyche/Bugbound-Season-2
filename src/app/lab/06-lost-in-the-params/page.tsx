import Link from 'next/link';
import { getNotes } from './data';

export default function FieldNotesIndex() {
  return (
    <div className="lv-card" style={{ maxWidth: 560 }}>
      <span className="lv-tag">Field Notes</span>
      <h1 className="lv-heading" data-testid="notes-title">
        Notes from the peninsula
      </h1>
      <ul className="lv-list">
        {getNotes().map((note) => (
          <li key={note.slug}>
            <Link href={`/lab/06-lost-in-the-params/notes/${note.slug}`} data-testid="note-link">
              {note.title}
            </Link>{' '}
            <span className="lv-muted">· {note.season}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
