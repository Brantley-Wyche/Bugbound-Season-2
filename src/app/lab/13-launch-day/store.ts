export interface LaunchProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface LaunchStore {
  products: LaunchProduct[];
  ordersToday: number;
}

const g = globalThis as unknown as { __s2Launch?: LaunchStore };
if (!g.__s2Launch) {
  g.__s2Launch = {
    products: [
      { id: 'nimbus-one', name: 'Nimbus One Brewer', price: 249, stock: 40 },
      { id: 'nimbus-mini', name: 'Nimbus Mini', price: 129, stock: 65 },
      { id: 'filter-pack', name: 'Filter Pack (100)', price: 12, stock: 500 },
    ],
    ordersToday: 0,
  };
}
const store = g.__s2Launch;

/** Returns a defensive copy — callers can't mutate inventory by accident. */
export function getProducts(): LaunchProduct[] {
  return store.products.map((p) => ({ ...p }));
}

export function getOrdersToday(): number {
  return store.ordersToday;
}

export function placeOrder(productId: string): boolean {
  const product = store.products.find((p) => p.id === productId);
  if (!product || product.stock <= 0) return false;
  product.stock -= 1;
  store.ordersToday += 1;
  return true;
}
