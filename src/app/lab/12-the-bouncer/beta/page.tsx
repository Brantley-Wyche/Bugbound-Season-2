export default function BetaLoungePage() {
  return (
    <div className="lv-card" style={{ maxWidth: 520 }}>
      <span className="lv-tag ok">Beta pass verified</span>
      <h1 className="lv-heading" data-testid="beta-dash">
        The Tasting Room
      </h1>
      <ul className="lv-list">
        <li>Lot #7 — anaerobic natural, tastes like a berry with a secret</li>
        <li>Lot #12 — honey process, currently dividing the staff</li>
        <li>Lot #19 — we are legally advised to call it “interesting”</li>
      </ul>
      <p className="lv-muted">You’re seeing this because the door checked your pass. Enjoy.</p>
    </div>
  );
}
