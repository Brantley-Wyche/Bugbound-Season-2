'use client';

import { useEffect, useState } from 'react';
import { getProducts, type Product } from './data';

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <div>
      <span className="lv-tag">Gear Shop</span>
      <h1 className="lv-heading" data-testid="shop-title" style={{ margin: '10px 0 14px' }}>
        Brew gear, chosen slowly
      </h1>
      {products.length === 0 ? (
        <p className="lv-muted">Loading products…</p>
      ) : (
        <div className="lv-grid">
          {products.map((p) => (
            <div className="lv-card" key={p.id} data-testid="product">
              <h2 className="lv-heading" data-testid="product-name">
                {p.name}
              </h2>
              <span className="lv-stat" data-testid="product-price">
                ${p.price}
              </span>
              <p className="lv-muted">{p.blurb}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
