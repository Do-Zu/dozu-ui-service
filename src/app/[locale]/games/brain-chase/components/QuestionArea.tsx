'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';

interface QuestionAreaProps {
  question: string;
  timeRemaining: number;
  timeLimit: number;
  errorsRemaining: number;
  score: number;
  totalQuestions: number;
  currentQuestionNumber: number;
  gameActive: boolean;
}

const QuestionArea = ({
  question = '',
  timeRemaining = 30,
  timeLimit = 30,
  errorsRemaining = 2,
  score = 0,
  totalQuestions = 5,
  currentQuestionNumber = 1,
  gameActive = false,
}: QuestionAreaProps) => {
  // Calculate time progress percentage
  const timeProgress = (timeRemaining / timeLimit) * 100;

  return (
    <div className="w-full h-full bg-background border-t border-border p-4 flex flex-col justify-between">
      {gameActive ? (
        <>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                Question {currentQuestionNumber}/{totalQuestions}
              </span>
              <span className="text-sm font-medium">Score: {score}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Errors left: {errorsRemaining}</span>
            </div>
          </div>

          <div className="flex-grow flex items-center justify-center">
            <h2 className="text-xl font-semibold text-center">{question}</h2>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Time remaining: {timeRemaining}s</span>
            </div>
            <Progress value={timeProgress} className="h-2" />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Start the game to see questions</p>
        </div>
      )}
    </div>
  );
};

export default QuestionArea;
