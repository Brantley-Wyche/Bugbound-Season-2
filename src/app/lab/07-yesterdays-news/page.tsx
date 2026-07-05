import PublishForm from './PublishForm';
import { getWireFeed } from './feed';

export default async function NewsroomPage() {
  const headlines = await getWireFeed();

  return (
    <div style={{ maxWidth: 560 }}>
      <span className="lv-tag">The Driftwood Wire</span>
      <h1 className="lv-heading" data-testid="wire-title" style={{ margin: '10px 0 14px' }}>
        Newsroom — live wire
      </h1>
      <PublishForm />
      <ul className="lv-list" style={{ marginTop: 14 }} data-testid="wire-list">
        {headlines.map((hl) => (
          <li key={hl.id} data-testid="headline">
            <strong>{hl.at}</strong> — {hl.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
