import { AddToCartButton } from './cart';

const BEANS = [
  { id: 'harbor-blend', name: 'Harbor Blend', price: '$14' },
  { id: 'foghorn-dark', name: 'Foghorn Dark', price: '$16' },
  { id: 'first-light', name: 'First Light Espresso', price: '$17' },
];

export default function BeansPage() {
  return (
    <div className="lv-card" data-testid="beans-page">
      <h1 className="lv-heading">Beans</h1>
      <ul className="lv-list">
        {BEANS.map((b) => (
          <li key={b.id} className="lv-row spread">
            <span>
              {b.name} <span className="lv-muted">{b.price}</span>
            </span>
            <AddToCartButton label={b.name} />
          </li>
        ))}
      </ul>
    </div>
  );
}
