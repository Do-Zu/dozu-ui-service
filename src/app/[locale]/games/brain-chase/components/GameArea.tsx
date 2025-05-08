'use client';

import React, { useState, useEffect, useRef } from 'react';
import AnswerBox from './AnswerBox';
import { useBrainChase } from '../context/brainChaseContext';

export default function GameArea() {
  const { formattedAnswers: answers } = useBrainChase();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Get initial height and width of the main frame container
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    setContainerSize({ width: rect.width, height: rect.height });
  }, []);

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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-background overflow-hidden border-b border-border"
    >
      {answers.map((answer) => {
        return (
          <AnswerBox
            key={answer.id}
            id={answer.id}
            text={answer.text}
            isCorrect={answer.isCorrect}
            gameAreaBounds={containerSize}
          />
        );
      })}
    </div>
  );
}
