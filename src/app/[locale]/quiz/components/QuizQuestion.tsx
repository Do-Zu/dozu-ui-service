'use client';

import { useState, useEffect } from 'react';

interface QuizQuestionProps {
  questionNumber: number;
  questionText: string;
  choices: string[];
  onAnswerSelect: (selectedIndex: number) => void;
}

const QuizQuestion = ({
  questionNumber,
  questionText,
  choices,
  onAnswerSelect,
}: QuizQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  useEffect(() => {
     setSelectedAnswer(null);
  }, [questionNumber]);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    onAnswerSelect(index);
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto mb-6 border border-border">
      <h3 className="text-xl font-semibold text-foreground mb-4">
        Question {questionNumber}: {questionText}
      </h3>

      {choices
        .map((choice, index) => ({ choice, index }))
        .filter(({ choice }) => choice != null && choice.trim() !== '')
        .map(({ choice, index }) => {
          const id = `q${questionNumber}-c${index}`;
          const isSelected = selectedAnswer === index;
          return (
            <label
              key={id}
              htmlFor={id}
              className={`flex items-center gap-3 mb-3 p-3 rounded-md border cursor-pointer transition
                ${isSelected ? 'border-primary bg-muted' : 'border-border hover:bg-muted'}`}
            >
              <input
                id={id}
                type="radio"
                name={`question-${questionNumber}`}
                checked={isSelected}
                onChange={() => handleAnswerSelect(index)}
                className="form-radio text-primary h-5 w-5"
              />
              <span className="text-lg text-foreground">{choice}</span>
            </label>
          );
        })}
    </div>
  );
};

export default QuizQuestion;
