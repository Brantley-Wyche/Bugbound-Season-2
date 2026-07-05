import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bugbound — Season 2',
  description:
    'Learn Next.js by fixing it. A level-based debugging game: every lesson ships with a real, intentionally planted bug.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
