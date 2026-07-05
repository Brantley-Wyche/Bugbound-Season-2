'use client';

import { useState } from 'react';
import { orderProduct } from './actions';

export default function OrderPanel({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<null | boolean>(null);

  async function order() {
    setBusy(true);
    const { ok } = await orderProduct(productId);
    setLastResult(ok);
    setBusy(false);
  }

  return (
    <div className="lv-row">
      <button
        className="lv-btn primary"
        data-testid={`order-${productId}`}
        onClick={order}
        disabled={busy}
      >
        {busy ? 'Ordering…' : `Order ${productName}`}
      </button>
      {lastResult === false && (
        <span className="lv-tag warn" data-testid="sold-out">
          Sold out
        </span>
      )}
    </div>
  );
}
