'use client';

export default function StatsBar({ ordersToday }: { ordersToday: number }) {
  const boardTime = new Date().toLocaleTimeString();

  return (
    <div className="lv-card" style={{ maxWidth: 'none' }}>
      <div className="lv-row spread">
        <span>
          Orders today: <strong data-testid="orders-today">{ordersToday}</strong>
        </span>
        <span className="lv-muted">
          Board updated <span data-testid="board-time">{boardTime}</span>
        </span>
      </div>
    </div>
  );
}
