'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnswerBoxProps {
  id: string;
  text: string;
  isCorrect: boolean;
  speed?: number; // Speed multiplier
  gameAreaBounds?: { width: number; height: number } | null;
  position?: { x: number; y: number };
  isPaused?: boolean;
  onSelect: (id: string, isCorrect: boolean) => void;
  onMeasure: (id: string, width: number, height: number) => void;
}

const AnswerBox = ({
  id,
  text,
  isCorrect = false,
  speed = 1,
  onSelect = () => {},
  gameAreaBounds = null,
  isPaused = false,
}: AnswerBoxProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const animationFrameIdRef = useRef<number>();
  // Initialize position and velocity
  useEffect(() => {
    if (!boxRef.current || !gameAreaBounds) return;

    // Get box dimensions
    const boxRect = boxRef.current.getBoundingClientRect();
    setDimensions({ width: boxRect.width, height: boxRect.height });

    // Set random initial position within game area bounds
    const maxX = gameAreaBounds.width - boxRect.width;
    const maxY = gameAreaBounds.height - boxRect.height;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    setPosition({ x: randomX, y: randomY });

    // Set random initial velocity
    const baseSpeed = 4;
    const adjustedSpeed = baseSpeed * speed;

    // Random Velocity X value between  -baseSpeed and baseSpeed pixels
    const randomVelocityX = (Math.random() * 2 - 1) * adjustedSpeed;
    // Random Velocity Y value between -baseSpeed and baseSpeed pixels
    const randomVelocityY = (Math.random() * 2 - 1) * adjustedSpeed;

    setVelocity({ x: randomVelocityX, y: randomVelocityY });
  }, [gameAreaBounds, speed]);

  // Animation loop for movement
  useEffect(() => {
    if (!gameAreaBounds || isPaused) return;

    const updatePosition = () => {
      setPosition((prevPosition) => {
        let newX = prevPosition.x + velocity.x;
        let newY = prevPosition.y + velocity.y;

        let newVelocityX = velocity.x;
        let newVelocityY = velocity.y;

        // Bounce off walls
        if (newX <= 0 || newX >= gameAreaBounds.width - dimensions.width) {
          newVelocityX = -velocity.x;
          newX = Math.max(0, Math.min(newX, gameAreaBounds.width - dimensions.width));
        }

        if (newY <= 0 || newY >= gameAreaBounds.height - dimensions.height) {
          newVelocityY = -velocity.y;
          newY = Math.max(0, Math.min(newY, gameAreaBounds.height - dimensions.height));
        }

        // Update velocity if it changed
        if (newVelocityX !== velocity.x || newVelocityY !== velocity.y) {
          setVelocity({ x: newVelocityX, y: newVelocityY });
        }

        return { x: newX, y: newY };
      });

      animationFrameIdRef.current = requestAnimationFrame(updatePosition);
    };

    animationFrameIdRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [velocity, gameAreaBounds, dimensions, isPaused]);

  const handleClick = () => {
    onSelect(id, isCorrect);
  };

  return (
    <div
      ref={boxRef}
      className={cn(
        'absolute flex items-center justify-center p-4 rounded-lg shadow-md cursor-pointer select-none transition-colors',
        'border-2',
        isCorrect ? 'bg-white' : 'bg-white', // Both same for now, will be revealed only when selected
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '120px',
        minHeight: '60px',
        maxWidth: '200px',
        transform: `translate(0, 0)`, // For smoother animation
        willChange: 'transform, left, top', // Performance optimization
      }}
      onClick={handleClick}
    >
      <p className="text-center font-medium text-sm md:text-base">{text}</p>
    </div>
  );
};

export default AnswerBox;
