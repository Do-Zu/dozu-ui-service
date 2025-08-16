    'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMemoryMatch } from '../context/MemoryMatchContext';
import { IMemoryCard } from '../types/memory-game.types';

interface MemoryCardProps {
  card: IMemoryCard;
  index: number;
  disabled?: boolean;
}

export default function MemoryCard({ card, index, disabled = false }: MemoryCardProps) {
  const { flipCard, canFlipCard } = useMemoryMatch();

  const handleClick = () => {
    if (disabled || !canFlipCard(card.id)) return;
    flipCard(card.id);
  };

  const isClickable = !disabled && canFlipCard(card.id);

  return (
    <div
      className={cn(
        'relative aspect-square transition-all duration-300',
        'hover:scale-105 hover:-translate-y-1',
        isClickable ? 'cursor-pointer' : 'cursor-not-allowed',
        card.isMatched && 'scale-95 opacity-60'
      )}
      onClick={handleClick}
      style={{
        animationDelay: `${index * 50}ms`,
        perspective: '1000px',
      }}
    >
      <div 
        className={cn(
          'relative w-full h-full transition-transform duration-500',
          card.isFlipped && 'rotate-y-180'
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: card.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Card Back (hidden when flipped) */}
        <Card 
          className={cn(
            'absolute inset-0',
            'bg-gradient-to-br from-purple-500 to-blue-600',
            'dark:from-purple-600 dark:to-blue-700',
            'border-2 border-purple-300 dark:border-purple-400',
            isClickable && 'hover:border-purple-400 dark:hover:border-purple-300 hover:shadow-lg'
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <CardContent className="flex items-center justify-center h-full p-2">
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-xs text-white/80 font-medium">
                Memory Card
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Front (visible when flipped) */}
        <Card 
          className={cn(
            'absolute inset-0 border-2 bg-white dark:bg-gray-800',
            card.type === 'front' 
              ? 'border-blue-300 dark:border-blue-500' 
              : 'border-green-300 dark:border-green-500',
            card.isMatched && 'border-yellow-400 dark:border-yellow-500'
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-3 relative">
            {/* Type badge */}
            <Badge 
              variant="outline" 
              className={cn(
                'absolute top-2 right-2 text-xs px-1 py-0',
                card.type === 'front' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500' 
                  : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500'
              )}
            >
              {card.type === 'front' ? 'Q' : 'A'}
            </Badge>

            {/* Card content */}
            <div className="text-center flex-1 flex items-center justify-center">
              <p className={cn(
                'font-medium leading-tight text-gray-900 dark:text-gray-100',
                card.content.length > 50 ? 'text-xs' : 
                card.content.length > 30 ? 'text-sm' : 'text-base'
              )}>
                {card.content}
              </p>
            </div>

            {/* Match indicator */}
            {card.isMatched && (
              <div 
                className="absolute inset-0 bg-yellow-200/20 dark:bg-yellow-300/30 flex items-center justify-center animate-pulse"
                style={{
                  animation: 'matchedPulse 0.6s ease-in-out',
                }}
              >
                <div className="text-2xl">✅</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Flip animation glow effect */}
      {card.isFlipped && !card.isMatched && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse" />
      )}

      {/* CSS-in-JS for keyframe animations */}
      <style jsx>{`
        @keyframes matchedPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
