'use client';

import React, { useState, useEffect, useRef } from 'react';
import AnswerBox from './AnswerBox';

interface GameAreaProps {
  currentQuestion?: string;
  answers: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  onCorrectAnswer: () => void;
  onIncorrectAnswer: () => void;
  speed: 'slow' | 'medium' | 'fast';
  isGameActive: boolean;
}

interface Position {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function GameArea({
  currentQuestion,
  answers,
  onCorrectAnswer = () => {},
  onIncorrectAnswer = () => {},
  speed = 'medium',
  isGameActive,
}: GameAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [boxSizes] = useState<Record<string, { width: number; height: number }>>({});
  const animationRef = useRef<number>();

  // Define speed multiplier based on game speed setting
  const speedMultiplier = {
    slow: 0.5,
    medium: 1,
    fast: 2,
  }[speed];

  // Get initial height and width of the main frame containerD
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    setContainerSize({ width: rect.width, height: rect.height });
  }, [answers, speed]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle answer selection
  const handleAnswerClick = (answerId: string, isCorrect: boolean) => {
    if (!isGameActive) return;

    if (isCorrect) {
      onCorrectAnswer();
    } else {
      onIncorrectAnswer();
    }
  };

  // Update box size when a box reports its dimensions
  const handleBoxMeasure = (id: string, width: number, height: number) => {
    boxSizes[id] = { width, height };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-background overflow-hidden border-b border-border"
    >
      {answers.map((answer) => {
        const position = positions[answer.id] || { x: 0, y: 0, vx: 0, vy: 0 };

        return (
          <AnswerBox
            key={answer.id}
            id={answer.id}
            text={answer.text}
            isCorrect={answer.isCorrect}
            gameAreaBounds={containerSize}
            position={{ x: position.x, y: position.y }}
            onSelect={() => handleAnswerClick(answer.id, answer.isCorrect)}
            onMeasure={handleBoxMeasure}
          />
        );
      })}
    </div>
  );
}
