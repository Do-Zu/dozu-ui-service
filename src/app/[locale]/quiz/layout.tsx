'use client';

import { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';
import { useRouter, useParams } from 'next/navigation';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizLayoutProps {
  children: ReactNode;
}

export default function QuizLayout({ children }: QuizLayoutProps) {
      const router = useRouter();
      const params = useParams();
      const topicId = params?.topicId as string;
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 bg-background p-8">
        <div className="max-w-7xl mx-auto bg-background border border-border shadow-lg rounded-lg p-8">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-foreground">Quiz</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/quiz/${topicId}/quiz-type`)}
              title="QuizHome"
            >
              <Home className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </Button>
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
