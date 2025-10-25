'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuizResultProps {
  totalScore: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

const QuizResult = ({ totalScore, correctAnswers, incorrectAnswers }: QuizResultProps) => (
  <Card className="mb-4">
    <CardHeader>
      <CardTitle>Quiz Result</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Total Score: {totalScore}</p>
      <p>Correct Answers: {correctAnswers}</p>
      <p>Incorrect Answers: {incorrectAnswers}</p>
    </CardContent>
  </Card>
);

export default QuizResult;
