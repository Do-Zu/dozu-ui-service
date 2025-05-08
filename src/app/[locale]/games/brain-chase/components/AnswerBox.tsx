'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useBrainChase } from '../context/brainChaseContext';

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

const BASE_SPEED = 2;

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

    const adjustedSpeed = BASE_SPEED * speedMultiplier;

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

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = undefined;
    }

    setIsClicked(true);

    setTimeout(() => {
      if (isCorrect) {
        onCorrectAnswer();
      } else {
        onIncorrectAnswer();
      }
    }, 300);
  };

  return (
    <div
      ref={boxRef}
      className={cn(
        'absolute flex items-center justify-center p-4 rounded-lg shadow-md cursor-pointer select-none transition-color',
        'border-2',
        'hover:shadow-lg hover:opacity-75 hover:scale-110',
        isCorrect && isClicked ? 'border-green-500 text-green-600' : 'border-gray-300',
        !isCorrect && isClicked ? 'border-red-600 text-red-500' : '',
        isGamePaused || isShowSettings
          ? 'pointer-events-none opacity-50'
          : 'pointer-events-auto opacity-100',
        isClicked ? ['animate-vibrate scale-150', 'opacity-0 transition-opacity duration-700'] : '',
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '120px',
        minHeight: '60px',
        maxWidth: '200px',
        transform: isClicked ? `translate(0, 0) scale(1.5)` : `translate(0, 0)`,
        willChange: 'transform, left, top, opacity',
      }}
      onClick={handleAnswerClick}
    >
      <p className="text-center font-medium text-sm md:text-base">{text}</p>
    </div>
  );
};

export default memo(AnswerBox);
