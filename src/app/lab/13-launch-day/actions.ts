'use server';

import { placeOrder } from './store';

export async function orderProduct(productId: string) {
  const ok = placeOrder(productId);
  return { ok };
}
