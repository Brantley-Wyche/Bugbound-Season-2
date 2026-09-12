import type { Metadata } from 'next';
import { levels } from '@/levels';

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
  return children;
}
