'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuizCardProps {
    quizId: number;
    correctAnswersCount: number;
    questionsCount: number;
    timeReviewed: string;
    quizTitle?: string;
    onClick?: () => void;
}

const QuizCard = ({
    quizId,
    correctAnswersCount,
    questionsCount,
    timeReviewed,
    quizTitle,
    onClick,
}: QuizCardProps) => {
    const scorePercent = Math.round((correctAnswersCount / questionsCount) * 100);
    const formattedTime = new Date(timeReviewed).toLocaleString('vi-VN', {
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
  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-border bg-muted"
>
  <CardHeader className="pb-2">
    <CardTitle className="text-lg font-bold text-primary leading-snug flex items-center gap-2">
      {quizTitle || `Quiz #${quizId}`}
    </CardTitle>
  </CardHeader>

  <CardContent className="text-sm text-muted-foreground space-y-1">
    <p>
      <span className="font-medium text-foreground">{correctAnswersCount}</span> correct out of{' '}
      <span className="text-foreground">{questionsCount}</span> questions
    </p>
    <p>
      Accuracy: <span className="font-semibold text-primary">{scorePercent}%</span>
    </p>
    <p>
      Reviewed on: <span className="text-muted-foreground">{formattedTime}</span>
    </p>
  </CardContent>
</Card>

    );
};

export default QuizCard;
