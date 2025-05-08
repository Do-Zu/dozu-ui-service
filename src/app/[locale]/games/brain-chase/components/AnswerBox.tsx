'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useBrainChase } from '../context/brainChaseContext';
import { toast } from '@/hooks/use-toast';

interface AnswerBoxProps {
  id: string;
  text: string;
  isCorrect: boolean;
  gameAreaBounds?: { width: number; height: number } | null;
}
interface Position {
  x: number;
  y: number;
}
const AnswerBox = ({ id, text, isCorrect = false, gameAreaBounds = null }: AnswerBoxProps) => {
  const {
    onCorrectAnswer,
    onIncorrectAnswer,
    settings,
    gameActive: isGameActive,
    gamePaused: isGamePaused,
    showSettings: isShowSettings,
  } = useBrainChase();

  const boxRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState<Position>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isClicked, setIsClicked] = useState(false);

  const animationFrameIdRef = useRef<number>();

  //Speed multiplier based on game speed setting
  const speedMultiplier = useMemo(() => {
    const choices = {
      slow: 0.5,
      medium: 1,
      fast: 2,
    };
    return choices[settings.speed];
  }, [settings.speed]);

  /**
   * Initialize position and velocity
   */
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
    const baseSpeed = 3;
    const adjustedSpeed = baseSpeed * speedMultiplier;

    // Random Velocity X value between  -baseSpeed and baseSpeed pixels
    const randomVelocityX = (Math.random() * 2 - 1) * adjustedSpeed;
    // Random Velocity Y value between -baseSpeed and baseSpeed pixels
    const randomVelocityY = (Math.random() * 2 - 1) * adjustedSpeed;

    setVelocity({ x: randomVelocityX, y: randomVelocityY });
  }, [gameAreaBounds, settings.speed]);

  /**
   *  Animation loop for movement
   */
  useEffect(() => {
    if (!gameAreaBounds || isGamePaused || isShowSettings) return;

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
  }, [velocity, gameAreaBounds, dimensions, isGamePaused, isShowSettings]);

  const handleAnswerClick = () => {
    if (!isGameActive || isGamePaused || isShowSettings) return;

    setIsClicked(true);

    if (isCorrect) {
      toast({
        title: 'Correct Answer',
      });
      onCorrectAnswer();
    } else {
      toast({
        description: 'Incorrect Answer',
        variant: 'destructive',
      });
      onIncorrectAnswer();
    }
  };

  if (isClicked && !isCorrect) return null;

  return (
    <div
      ref={boxRef}
      className={cn(
        'absolute flex items-center justify-center p-4 rounded-lg shadow-md cursor-pointer select-none transition-colors hover:scale-50',
        'border-2',
        'hover:shadow-lg',
        !isCorrect && isClicked ? 'border-red-400' : 'border-green-500',
        isCorrect && isClicked ? 'border-green-500' : 'border-gray-300',
        isGamePaused ? 'pointer-events-none' : 'pointer-events-auto',
        isShowSettings ? 'pointer-events-none' : 'pointer-events-auto',
        isClicked ? 'opacity-50' : 'opacity-100',
        isGamePaused ? 'opacity-50' : 'opacity-100',
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
      onClick={handleAnswerClick}
    >
      <p className="text-center font-medium text-sm md:text-base">{text}</p>
    </div>
  );
};

export default AnswerBox;
