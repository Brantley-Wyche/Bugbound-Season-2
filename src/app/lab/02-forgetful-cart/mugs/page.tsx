import { AddToCartButton } from '../cart';

const MUGS = [
  { id: 'diner-classic', name: 'Diner Classic', price: '$12' },
  { id: 'lighthouse', name: 'Lighthouse 16oz', price: '$18' },
];

export default function MugsPage() {
  return (
    <div className="lv-card" data-testid="mugs-page">
      <h1 className="lv-heading">Mugs</h1>
      <ul className="lv-list">
        {MUGS.map((m) => (
          <li key={m.id} className="lv-row spread">
            <span>
              {m.name} <span className="lv-muted">{m.price}</span>
            </span>
            <AddToCartButton label={m.name} />
          </li>
        ))}
      </ul>
    </div>
  );
}
