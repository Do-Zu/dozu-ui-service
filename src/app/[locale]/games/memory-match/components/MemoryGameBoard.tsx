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
    <div className="w-full h-full">
      <div 
        className={`grid ${getGridClass()} gap-2 max-w-4xl mx-auto p-4 bg-muted/20 rounded-lg border shadow-lg`}
        style={{
          height: 'calc(100vh - 180px)',
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
      
      {/* Game board info */}
      {/* <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Grid: {getGridClass().replace('grid-cols-', '')} columns • Total Cards: {cards.length}
      </div> */}
    </div>
  );
}
