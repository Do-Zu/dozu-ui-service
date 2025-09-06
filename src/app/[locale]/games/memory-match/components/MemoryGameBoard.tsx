'use client';

import React from 'react';
import { useMemoryMatch } from '../context/MemoryMatchContext';
import MemoryCard from './MemoryCard';

export default function MemoryGameBoard() {
  const { cards, gameStatus } = useMemoryMatch();

  if (!cards || cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No cards available</p>
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
    <div className="w-full relative">
      <div 
        className={`grid ${getGridClass()} gap-4 max-w-4xl mx-auto p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 shadow-lg`}
        style={{ aspectRatio: '4/3' }}
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
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Grid: {getGridClass().replace('grid-cols-', '')} columns • Total Cards: {cards.length}
      </div>
    </div>
  );
}
