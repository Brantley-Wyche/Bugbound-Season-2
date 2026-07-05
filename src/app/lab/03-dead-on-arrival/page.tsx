import FaqList from './FaqList';

export default function SupportPage() {
  return (
    <div className="lv-card" style={{ maxWidth: 560 }}>
      <span className="lv-tag">Support</span>
      <h1 className="lv-heading" data-testid="support-title">
        Frequently asked questions
      </h1>
      <p className="lv-muted">
        Answers to the things our inbox sees every week. Click a question to expand it.
      </p>
      <FaqList onOpen={(question) => console.log(`[support-analytics] opened: ${question}`)} />
    </div>
  );
}
