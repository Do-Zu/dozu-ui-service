'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface QuizCardProps {
  quizId: number;
  correctAnswersCount: number;
  questionsCount: number;
  timeReviewed: string;
  quizTitle?: string;
  onClick?: () => void;
}

export default function QuizCard({
  quizId,
  correctAnswersCount,
  questionsCount,
  timeReviewed,
  quizTitle,
  onClick,
}: QuizCardProps) {
  const percent = Math.round((correctAnswersCount / (questionsCount || 1)) * 100);

  // Define color tone for score + performance label
  let performance = {
    label: 'Keep going',
    badge: 'bg-red-100 text-red-700',
    scoreColor: 'text-red-600',
  };

  if (percent >= 90)
    performance = {
      label: 'Excellent',
      badge: 'bg-green-100 text-green-700',
      scoreColor: 'text-green-600',
    };
  else if (percent >= 70)
    performance = {
      label: 'Good job',
      badge: 'bg-blue-100 text-blue-700',
      scoreColor: 'text-blue-600',
    };
  else if (percent >= 50)
    performance = {
      label: 'Can improve',
      badge: 'bg-amber-100 text-amber-700',
      scoreColor: 'text-amber-600',
    };

  const reviewed = new Date(timeReviewed).toLocaleString('vi-VN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      onClick={onClick}
      className="
        cursor-pointer rounded-xl border border-border
        hover:shadow-lg hover:border-primary/70
        transition-all duration-200 bg-muted/40
      "
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base md:text-lg font-semibold text-foreground line-clamp-2">
            {quizTitle || `Quiz #${quizId}`}
          </CardTitle>

          <span
            className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium',
              performance.badge
            )}
          >
            {performance.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground space-y-2">
        {/* Stats row */}
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1 text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {correctAnswersCount}/{questionsCount} correct
          </p>

          <span
            className={clsx(
              'px-2 py-0.5 rounded-md text-sm font-bold',
              performance.scoreColor
            )}
          >
            {percent}% score
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs opacity-75">
          <Clock className="h-3.5 w-3.5" />
          Reviewed on: {reviewed}
        </div>
      </CardContent>
    </Card>
  );
}
