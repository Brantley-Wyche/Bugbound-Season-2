export default function VenuePage() {
  return (
    <div className="lv-card">
      <h1 className="lv-heading" data-testid="venue-title">
        Harbor Hall
      </h1>
      <p className="lv-muted" data-testid="venue-address">
        14 Quayside Walk, Driftwood Bay — five minutes from the ferry terminal.
      </p>
      <p className="lv-muted">
        Doors open 45 minutes before the first session. The lighthouse room is upstairs.
      </p>
    </div>
  );
}
