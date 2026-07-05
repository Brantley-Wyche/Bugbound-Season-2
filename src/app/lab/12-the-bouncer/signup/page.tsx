import JoinPanel from './JoinPanel';

export default function SignupPage() {
  return (
    <div className="lv-card" style={{ maxWidth: 480 }}>
      <span className="lv-tag warn">Members only past this point</span>
      <h1 className="lv-heading" data-testid="signup-page">
        The Tasting Room is in beta
      </h1>
      <p className="lv-muted">
        Rare lots, experimental roasts, and opinions we’re not ready to defend publicly. Join
        the beta and walk right in.
      </p>
      <JoinPanel />
    </div>
  );
}
