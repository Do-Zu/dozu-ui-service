    'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMemoryMatch } from '../context/MemoryMatchContext';
import { IMemoryCard } from '../types/memory-game.types';
import { useTranslations } from 'next-intl';

interface MemoryCardProps {
  card: IMemoryCard;
  index: number;
  disabled?: boolean;
}

export default function MemoryCard({ card, index, disabled = false }: MemoryCardProps) {
  const t = useTranslations('games.common');
  const { flipCard, canFlipCard } = useMemoryMatch();

  const handleClick = () => {
    if (disabled || !canFlipCard(card.id)) return;
    flipCard(card.id);
  };

  const isClickable = !disabled && canFlipCard(card.id);

  return (
    <div
      className={cn(
        'relative w-full h-full transition-all duration-300',
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
            'bg-gradient-to-br from-gray-100 to-gray-300',
            'dark:from-gray-800 dark:to-gray-900',
            'border-2 border-gray-300 dark:border-gray-600',
            isClickable && 'hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-lg'
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <CardContent className="flex items-center justify-center h-full p-2">
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                {t('memoryCard')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Front (visible when flipped) */}
        <Card 
          className={cn(
            'absolute inset-0 border-2 bg-white dark:bg-gray-800',
            card.type === 'front' 
              ? 'border-gray-400 dark:border-gray-500' 
              : 'border-gray-500 dark:border-gray-400',
            card.isMatched && 'border-green-400 dark:border-green-500'
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
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white border-gray-400 dark:border-gray-500' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white border-gray-500 dark:border-gray-400'
              )}
            >
              {card.type === 'front' ? 'Q' : 'A'}
            </Badge>

            {/* Card content */}
            <div className="text-center flex-1 flex items-center justify-center">
              <p className={cn(
                'font-medium leading-tight text-gray-900 dark:text-white',
                card.content.length > 50 ? 'text-xs' : 
                card.content.length > 30 ? 'text-sm' : 'text-base'
              )}>
                {card.content}
              </p>
            </div>

            {/* Match indicator */}
            {card.isMatched && (
              <div 
                className="absolute inset-0 bg-green-100/50 dark:bg-green-800/30 flex items-center justify-center animate-pulse"
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
