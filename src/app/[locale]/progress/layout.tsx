import { ReactNode } from 'react';

interface ProgressLayoutProps {
  children: ReactNode;
}

export default function ProgressLayout({ children }: ProgressLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
} 