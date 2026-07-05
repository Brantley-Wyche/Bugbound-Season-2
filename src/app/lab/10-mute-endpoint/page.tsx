import FeedbackPanel from './FeedbackPanel';

export default function FeedbackPage() {
  return (
    <div style={{ maxWidth: 560 }}>
      <span className="lv-tag">Customer Voice</span>
      <h1 className="lv-heading" data-testid="feedback-title" style={{ margin: '10px 0 14px' }}>
        How are we doing?
      </h1>
      <p className="lv-muted" style={{ marginBottom: 14 }}>
        Live tally of praise and gripes from the café floor.
      </p>
      <FeedbackPanel />
    </div>
  );
}
