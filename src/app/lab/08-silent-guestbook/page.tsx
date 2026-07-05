import { signGuestbook } from './actions';
import { getEntries } from './store';

export default function GuestbookPage() {
  const entries = getEntries();

  return (
    <div style={{ maxWidth: 560 }}>
      <span className="lv-tag">Café Guestbook</span>
      <h1 className="lv-heading" data-testid="guestbook-title" style={{ margin: '10px 0 14px' }}>
        Leave a note for the house
      </h1>

      <form action={signGuestbook} className="lv-row" data-testid="guestbook-form">
        <input
          className="lv-input"
          style={{ flex: 1 }}
          name="message"
          placeholder="Say something nice (or at least true)…"
          data-testid="message-input"
        />
        <button className="lv-btn primary" type="submit" data-testid="sign">
          Sign
        </button>
      </form>

      <ul className="lv-list" style={{ marginTop: 14 }} data-testid="entries">
        {entries.map((entry) => (
          <li key={entry.id} data-testid="entry">
            <span className="lv-muted">{entry.at}</span> — {entry.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
