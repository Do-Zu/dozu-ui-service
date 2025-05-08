'use client';

import React, { useState, useEffect, useRef } from 'react';
import AnswerBox from './AnswerBox';
import { useBrainChase } from '../context/brainChaseContext';
import { cn } from '@/lib/utils';

export default function GameArea() {
  const { formattedAnswers: answers } = useBrainChase();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Get initial height and width of the main frame container
  useEffect(() => {
    if (!containerRef.current) return;

    const updateContainerSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    // Initial size calculation
    updateContainerSize();

    // Small delay to ensure proper rendering after component mount
    const initialResizeTimer = setTimeout(updateContainerSize, 100);
    return () => clearTimeout(initialResizeTimer);
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
    <div ref={containerRef} className="relative w-full h-full bg-background overflow-hidden">
      {answers.map((answer, index) => {
        return (
          <div
            key={answer.id}
            className={cn('opacity-0', `animate-fade-in-up`)}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'forwards',
            }}
          >
            <AnswerBox
              id={answer.id}
              text={answer.text}
              isCorrect={answer.isCorrect}
              gameAreaBounds={containerSize}
            />
          </div>
        );
      })}
    </div>
  );
}
