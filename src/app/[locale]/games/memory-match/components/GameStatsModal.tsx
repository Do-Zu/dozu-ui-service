'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import GameStats from './GameStats';
import { useTranslations } from 'next-intl';

interface GameStatsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GameStatsModal({ isOpen, onOpenChange }: GameStatsModalProps) {
  const t = useTranslations('games.memoryMatch');

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* Sidebar phủ toàn màn hình */}
      <div className="absolute right-0 top-0 h-full w-[350px] sm:w-[400px] bg-background border-l shadow-xl animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-xl font-bold">{t('gameStats')}</h2>
              <p className="text-sm text-muted-foreground">{t('gameStatsDescription')}</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Nội dung */}
          <div className="flex-1 overflow-y-auto p-4">
            <GameStats />
          </div>
        </div>
      </div>
    </div>
  );

  // Dùng portal để render modal ra ngoài root layout
  if (typeof window !== 'undefined') {
    return ReactDOM.createPortal(modalContent, document.body);
  }

  return null;
}