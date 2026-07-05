'use client';

import { createContext, useContext, useState } from 'react';

const CartContext = createContext<{ count: number; add: () => void }>({
  count: 0,
  add: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  return (
    <CartContext.Provider value={{ count, add: () => setCount((c) => c + 1) }}>
      {children}
    </CartContext.Provider>
  );
}

export function CartBadge() {
  const { count } = useContext(CartContext);
  return (
    <span className="lv-tag" title="Items in cart">
      Cart: <span data-testid="cart-count">{count}</span>
    </span>
  );
}

export function AddToCartButton({ label }: { label: string }) {
  const { add } = useContext(CartContext);
  return (
    <button className="lv-btn" data-testid="add-to-cart" onClick={add}>
      Add {label}
    </button>
  );
}
