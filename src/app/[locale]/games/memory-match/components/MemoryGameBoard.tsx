'use client';

import React from 'react';
import { useMemoryMatch } from '../context/MemoryMatchContext';
import MemoryCard from './MemoryCard';

export default function MemoryGameBoard() {
  const { cards, gameStatus } = useMemoryMatch();

  if (!cards || cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          No cards available
        </p>
      </div>
    );
  }

  // Calculate grid layout based on number of cards
  const getGridClass = () => {
    const cardCount = cards.length;
    if (cardCount <= 12) return 'grid-cols-4'; // 4x3 grid
    if (cardCount <= 16) return 'grid-cols-4'; // 4x4 grid
    return 'grid-cols-6'; // 6x4 grid
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div 
        className={`grid ${getGridClass()} gap-3 w-full h-full p-4 bg-muted/20 rounded-lg border shadow-lg overflow-auto`}
        style={{
          height: '100%',
          gridAutoRows: 'minmax(120px, 1fr)',
          backgroundColor: 'var(--muted)',
          borderColor: 'var(--border)',
        }}
      >
        {cards.map((card, index) => (
          <MemoryCard
            key={card.id}
            card={card}
            index={index}
            disabled={gameStatus !== 'playing'}
          />
        ))}
      </div>
    </div>
  );
}
