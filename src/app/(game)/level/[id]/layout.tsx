import type { Metadata } from 'next';
import { Source_Serif_4 } from 'next/font/google';
import { levels } from '@/levels';

// The Concept reference reads in a text serif; only incident routes load it.
const conceptSerif = Source_Serif_4({
  variable: '--font-concept-serif',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const level = levels.find((item) => item.id === id);
  return {
    title: level
      ? `${level.title} | Bugbound Season 2`
      : 'Incident not found | Bugbound Season 2',
  };
}

export default function IncidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${conceptSerif.variable} incident-fonts`}>{children}</div>
  );
}
