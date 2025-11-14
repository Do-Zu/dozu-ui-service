'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionPerformance, PerformanceBreakdown } from '@/types/activity';
import QuestionDetailList from './QuestionDetailList';
import CircularProgressChart from './CircularProgressChart';

interface TermProgressTabProps {
  questions: QuestionPerformance[];
  performance: PerformanceBreakdown;
}

export default function TermProgressTab({ questions, performance }: TermProgressTabProps) {
  return (
    <div className="space-y-6">
      {/* Progress of Terms Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Tiến trình thuật ngữ</CardTitle>
        </CardHeader>
        <CardContent>
          <CircularProgressChart performance={performance} />
        </CardContent>
      </Card>

      {/* Term Progress Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Term Progress Details</CardTitle>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            Detailed breakdown of student performance for each term
          </p>
        </CardHeader>
        <CardContent>
          <QuestionDetailList questions={questions} />
        </CardContent>
      </Card>
    </div>
  );
}
