const SESSIONS = [
  { time: 'Fri 10:00', title: 'Deleting Code as a Love Language' },
  { time: 'Fri 14:00', title: 'The 404 That Cost Us a Weekend' },
  { time: 'Sat 11:00', title: 'Boring Deploys: A Retrospective' },
  { time: 'Sun 09:30', title: 'Naming Things (Rescheduled Again)' },
];

export default function SchedulePage() {
  return (
    <div className="lv-card">
      <h1 className="lv-heading" data-testid="schedule-title">
        Schedule
      </h1>
      <ul className="lv-list">
        {SESSIONS.map((s) => (
          <li key={s.title} data-testid="session">
            <strong>{s.time}</strong> — {s.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
