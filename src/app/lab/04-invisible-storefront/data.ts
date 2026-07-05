export interface Product {
  id: string;
  name: string;
  price: number;
  blurb: string;
}

const CATALOG: Product[] = [
  { id: 'kettle', name: 'Gooseneck Kettle', price: 68, blurb: 'Pour like you mean it.' },
  { id: 'grinder', name: 'Hand Grinder Mk II', price: 89, blurb: '40 clicks to perfection.' },
  { id: 'scale', name: 'Brew Scale', price: 42, blurb: '0.1g resolution, zero drama.' },
  { id: 'dripper', name: 'Ceramic Dripper', price: 24, blurb: 'The classic, in matte navy.' },
  { id: 'carafe', name: 'Double-Wall Carafe', price: 36, blurb: 'Stays hot. Looks cool.' },
];

/** Simulates the catalog service — a small async read, like any real API call. */
export async function getProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return CATALOG;
}
