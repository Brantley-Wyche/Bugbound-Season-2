import CtaButton from './CtaButton';

export const pageMeta = {
  title: 'Northwind Analytics — See your data clearly',
  description:
    'Dashboards, alerts, and answers for teams who would rather look at one chart than forty.',
};

export default function LandingPage() {
  return (
    <div style={{ maxWidth: 560 }}>
      <span className="lv-tag">Northwind Analytics</span>
      <h1 className="lv-heading" data-testid="hero-title" style={{ margin: '10px 0 10px' }}>
        See your data clearly
      </h1>
      <p className="lv-muted" style={{ marginBottom: 14 }}>
        Dashboards, alerts, and answers for teams who would rather look at one chart than forty.
      </p>
      <ul className="lv-list" style={{ marginBottom: 14 }}>
        <li data-testid="feature">Live dashboards that stay live</li>
        <li data-testid="feature">Alerts with taste — no 3am false alarms</li>
        <li data-testid="feature">Answers in plain language, sources attached</li>
      </ul>
      <CtaButton />
    </div>
  );
}
