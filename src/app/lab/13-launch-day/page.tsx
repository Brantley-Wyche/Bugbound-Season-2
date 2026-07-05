import OrderPanel from './OrderPanel';
import StatsBar from './StatsBar';
import { getOrdersToday, getProducts } from './store';

export default function LaunchDayPage() {
  const products = getProducts();

  return (
    <div style={{ maxWidth: 640 }}>
      <span className="lv-tag ok">LIVE</span>
      <h1 className="lv-heading" data-testid="launch-hero" style={{ margin: '10px 0 6px' }}>
        Nimbus launch day
      </h1>
      <p className="lv-muted" style={{ marginBottom: 14 }}>
        The brewer we spent two years arguing about is finally real. Stock is limited; the
        board below is live.
      </p>

      <StatsBar ordersToday={getOrdersToday()} />

      <ul className="lv-list" style={{ marginTop: 14 }}>
        {products.map((p) => (
          <li key={p.id} data-testid="product-row">
            <div className="lv-row spread">
              <span>
                <strong>{p.name}</strong> <span className="lv-muted">${p.price}</span>
              </span>
              <span className="lv-muted">
                In stock: <strong data-testid={`stock-${p.id}`}>{p.stock}</strong>
              </span>
            </div>
            <OrderPanel productId={p.id} productName={p.name} />
          </li>
        ))}
      </ul>

      <div className="lv-row" style={{ marginTop: 14 }}>
        <p className="lv-muted">Missed a drop?</p>
        <button className="lv-btn" onClick={() => console.log('[launch] restock alert requested')}>
          Get restock alerts
        </button>
      </div>
    </div>
  );
}
