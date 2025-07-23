'use client';

import { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';

interface QuizLayoutProps {
  children: ReactNode;
}

export default function QuizLayout({ children }: QuizLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 bg-background p-8">
        <div className="max-w-7xl mx-auto bg-background border border-border shadow-lg rounded-lg p-8">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-foreground">Quiz</h1>
          </header>

          <Separator className="mb-6 bg-border" />

          <div className="flex flex-col space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
