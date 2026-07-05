import WelcomeCard from './WelcomeCard';

export default function LoungePage() {
  return (
    <div>
      <span className="lv-tag">Members’ Lounge</span>
      <h1 className="lv-heading" style={{ margin: '10px 0 14px' }} data-testid="lounge-title">
        The Slow Pour Society
      </h1>
      <WelcomeCard />
      <p className="lv-muted" style={{ marginTop: 14 }}>
        House rules: no rushing the bloom, no judging instant drinkers (to their face).
      </p>
    </div>
  );
}
