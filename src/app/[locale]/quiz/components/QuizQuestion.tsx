'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizQuestionProps {
  questionNumber: number;
  questionText: string;
  choices: string[];
  onAnswerSelect: (selectedIndex: number) => void;
  selectedAnswer?: number | null;
  isCorrect?: boolean | null; // null = chưa biết, true/false = đã biết kết quả
  correctIndex?: number; // Index của đáp án đúng
  showResult?: boolean; // Whether to show correct/incorrect feedback
}

const QuizQuestion = ({
  questionNumber,
  questionText,
  choices,
  onAnswerSelect,
  selectedAnswer: externalSelectedAnswer,
  isCorrect,
  correctIndex,
  showResult = true,
}: QuizQuestionProps) => {
  const [internalSelectedAnswer, setInternalSelectedAnswer] = useState<number | null>(null);
  
  // Use external selectedAnswer if provided, otherwise use internal state
  const selectedAnswer = externalSelectedAnswer !== undefined ? externalSelectedAnswer : internalSelectedAnswer;
  
  useEffect(() => {
    if (externalSelectedAnswer === undefined) {
      setInternalSelectedAnswer(null);
    }
  }, [questionNumber, externalSelectedAnswer]);

  const handleAnswerSelect = (index: number) => {
    // Don't allow answer selection if results are being shown (after submit)
    if (showResult) {
      return;
    }
    
    if (externalSelectedAnswer === undefined) {
      setInternalSelectedAnswer(index);
    }
    onAnswerSelect(index);
  };

  // Determine styling based on answer state
  const getChoiceStyle = (index: number, isSelected: boolean) => {
    if (!showResult || isCorrect === null || isCorrect === undefined) {
      // No result yet - just show selection
      return isSelected 
        ? 'border-primary bg-muted' 
        : 'border-border hover:bg-muted';
    }
    
    // Result is known
    const isCorrectAnswer = correctIndex !== undefined && index === correctIndex;
    const isWrongSelected = isSelected && !isCorrect;
    
    if (isCorrectAnswer) {
      // Correct answer - always show green
      return 'border-green-500 bg-green-50 dark:bg-green-950/20';
    } else if (isWrongSelected) {
      // Wrong selected answer - show red
      return 'border-red-500 bg-red-50 dark:bg-red-950/20';
    } else if (isSelected && isCorrect) {
      // Correct selected answer
      return 'border-green-500 bg-green-50 dark:bg-green-950/20';
    }
    
    return 'border-border hover:bg-muted';
  };

  const getChoiceIcon = (index: number, isSelected: boolean) => {
    if (!showResult || isCorrect === null || isCorrect === undefined) {
      return null;
    }
    
    const isCorrectAnswer = correctIndex !== undefined && index === correctIndex;
    const isWrongSelected = isSelected && !isCorrect;
    
    if (isCorrectAnswer) {
      return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />;
    } else if (isWrongSelected) {
      return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />;
    } else if (isSelected && isCorrect) {
      return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />;
    }
    
    return null;
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto mb-6 border border-border">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">
          Question {questionNumber}: {questionText}
        </h3>
        {showResult && isCorrect !== null && isCorrect !== undefined && (
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Correct
              </span>
            ) : (
              <span className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                Incorrect
              </span>
            )}
          </div>
        )}
      </div>

      {choices
        .map((choice, index) => ({ choice, index }))
        .filter(({ choice }) => choice != null && choice.trim() !== '')
        .map(({ choice, index }) => {
          const id = `q${questionNumber}-c${index}`;
          const isSelected = selectedAnswer === index;
          const style = getChoiceStyle(index, isSelected);
          const icon = getChoiceIcon(index, isSelected);
          // Disable if results are shown (after submit)
          const isDisabled = showResult;
          
          return (
            <label
              key={id}
              htmlFor={id}
              className={`flex items-center gap-3 mb-3 p-3 rounded-md border cursor-pointer transition
                ${style} ${isDisabled ? 'cursor-not-allowed opacity-90' : ''}`}
            >
              <input
                id={id}
                type="radio"
                name={`question-${questionNumber}`}
                checked={isSelected}
                onChange={() => !isDisabled && handleAnswerSelect(index)}
                disabled={isDisabled}
                className="form-radio text-primary h-5 w-5 disabled:cursor-not-allowed"
              />
              <span className="text-lg text-foreground flex-1">{choice}</span>
              {icon}
            </label>
          );
        })}
    </div>
  );
};

export default QuizQuestion;
