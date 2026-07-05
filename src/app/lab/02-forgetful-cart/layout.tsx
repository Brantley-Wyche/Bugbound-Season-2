import { CartBadge, CartProvider } from './cart';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <nav className="lv-nav">
        <span className="brand">Driftwood Roasters</span>
        <a href="/lab/02-forgetful-cart" data-testid="nav-beans">
          Beans
        </a>
        <a href="/lab/02-forgetful-cart/mugs" data-testid="nav-mugs">
          Mugs
        </a>
        <CartBadge />
      </nav>
      {children}
    </CartProvider>
  );
}
