'use client';

import { ProgressProvider } from '@/shell/progress/ProgressProvider';
import Workspace from '@/shell/workspace/Workspace';
import '@/shell/workspace/workspace.css';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProgressProvider>
      <Workspace>{children}</Workspace>
    </ProgressProvider>
  );
}
