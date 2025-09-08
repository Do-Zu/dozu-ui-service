'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Home, 
  Trophy,
  Clock,
  Target,
  Zap,
  BarChart3,
  X
} from 'lucide-react';
import { useMemoryMatch } from '../context/MemoryMatchContext';
import MemoryGameBoard from './MemoryGameBoard';
import GameStats from './GameStats';
import { useTranslations } from 'next-intl';

export default function MemoryMatchGame() {
  const t = useTranslations('games.memoryMatch');
  const t1 = useTranslations('games.common');
  const router = useRouter();
  const [showStats, setShowStats] = useState(false);
  
  const {
    gameStatus,
    topicInfo,
    stats,
    settings,
    isLoading,
    error,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    getGameProgress,
  } = useMemoryMatch();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mb-4"></div>
        <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">{t('loading')}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t('loadingMessage')}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">{t('errorTitle')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{t('errorMessage')}</p>
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()} variant="outline" className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
            {t('tryAgain')}
          </Button>
          <Button onClick={() => router.back()} className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
            {t('backToTopic')}
          </Button>
        </div>
      </div>
    );
  }

  // Game failed (no flashcards)
  if (gameStatus === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-yellow-500 text-6xl mb-4">🎯</div>
        <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">{t('errorTitle')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{t('errorMessage')}</p>
        <Button onClick={() => router.back()} className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
          {t('backToTopic')}
        </Button>
      </div>
    );
  }

  // Check if in fullscreen game mode
  const isFullscreenGame = gameStatus === 'playing' || gameStatus === 'paused' || gameStatus === 'completed';

  // Fullscreen game layout
  if (isFullscreenGame) {
    return (
      <div className="relative w-full h-full bg-white dark:bg-gray-900 overflow-hidden">
        {/* Floating control bar - Responsive to sidebar */}
        <div className={`absolute top-4 z-10 flex justify-center items-center transition-all duration-300 ease-in-out ${showStats ? 'left-4 right-[340px]' : 'left-4 right-4'}`}>
          <div className="flex items-center gap-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.back()}
              className="gap-2 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Home className="h-4 w-4" />
              {t('back')}
            </Button>
            
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
            
            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-200">
              {gameStatus === 'playing' ? t('playing') : 
               gameStatus === 'paused' ? t('paused') : 
               gameStatus === 'completed' ? t('completed') : gameStatus}
            </Badge>
            
            <Badge variant="secondary" className="gap-1 dark:bg-gray-700 dark:text-gray-200">
              <Clock className="h-3 w-3" />
              {Math.floor(stats.timeElapsed / 60)}:
              {(stats.timeElapsed % 60).toString().padStart(2, '0')}
            </Badge>
            
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
            
            {/* Game controls */}
            <div className="flex gap-2">
              {gameStatus === 'playing' && (
                <Button variant="outline" size="sm" onClick={pauseGame} className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              {gameStatus === 'paused' && (
                <Button variant="outline" size="sm" onClick={resumeGame} className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  <Play className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={resetGame} className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
            
            {/* Stats Toggle Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowStats(!showStats)}
              className="gap-2 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Area - Flex layout */}
        <div className="relative w-full h-screen bg-white dark:bg-gray-900 overflow-hidden">
          {/* Game Board - Auto resize based on sidebar state */}
          <div className="flex h-[calc(100vh-2rem)]">
            <div className={`flex items-center justify-center px-4 transition-all duration-300 ease-in-out ${showStats ? 'w-[calc(100%-336px)]' : 'w-full'} flex-1 min-h-0`}>
              <div className="w-full max-w-4xl">
                <MemoryGameBoard />
              </div>
            </div>

          {/* Right Sidebar - Fixed width with left margin */}
          {showStats && (
            <div className="w-80 mr-4 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg flex flex-col max-h-[calc(100vh-4rem)] rounded-l-lg">
              <div className="flex-1 overflow-y-auto p-4">
                <GameStats />
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Overlay for mobile */}
        {showStats && (
          <div 
            className="absolute inset-0 bg-black/50 z-15 lg:hidden"
            onClick={() => setShowStats(false)}
          />
        )}

        {/* Game Completed Modal */}
        {gameStatus === 'completed' && (
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-30">
            <Card className="w-full max-w-md mx-4 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-2xl">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('congratulations')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('completedAllPairs', { pairs: stats.totalPairs })}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
                    <div className="font-medium text-purple-600 dark:text-purple-400 text-lg">{stats.score}</div>
                    <div className="text-gray-500 dark:text-gray-400">{t('finalScore')}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
                    <div className="font-medium text-purple-600 dark:text-purple-400 text-lg">{stats.moves}</div>
                    <div className="text-gray-500 dark:text-gray-400">{t('totalMoves')}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
                    <div className="font-medium text-purple-600 dark:text-purple-400 text-lg">
                      {Math.floor(stats.timeElapsed / 60)}:{(stats.timeElapsed % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">{t('time')}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
                    <div className="font-medium text-purple-600 dark:text-purple-400 text-lg">
                      {stats.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">{t('accuracy')}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetGame} className="flex-1 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                    {t('playAgain')}
                  </Button>
                  <Button onClick={() => router.back()} className="flex-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white">
                    {t1('backToFlashcards')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Start screen layout (normal layout)
  return (
    <div className="min-h-screen p-4 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="gap-2 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Home className="h-4 w-4" />
              {t('back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-300">{t('title')}</h1>
              {topicInfo && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Topic: {topicInfo.name || topicInfo.title || 'Unknown'}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-1 dark:bg-gray-700 dark:text-gray-200">
              <Target className="h-3 w-3" />
              {stats.totalPairs} {t('pairs')}
            </Badge>
            <Badge variant="outline" className="gap-1 dark:border-gray-600 dark:text-gray-200">
              <Trophy className="h-3 w-3" />
              {t('score')}: {stats.score}
            </Badge>
          </div>
        </div>

        {/* Game Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium dark:text-gray-200">{t('gameProgress')}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stats.matches}/{stats.totalPairs} {t('pairs')} {t('matched')}  
            </span>
          </div>
          <Progress value={getGameProgress()} className="h-2 dark:bg-gray-700" />
        </div>

        {/* Start screen content */}
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-center max-w-lg">
            <div className="text-6xl mb-6">🧠</div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {t('description')}
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
              <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <span className="font-medium dark:text-gray-100">{t('quickMemory')}</span>
                <span className="text-gray-500 dark:text-gray-400">{t('rememberPositions')}</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                <Target className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <span className="font-medium dark:text-gray-100">{t('findPairs')}</span>
                <span className="text-gray-500 dark:text-gray-400">{t('matchFrontBack')}</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                <Zap className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <span className="font-medium dark:text-gray-100">{t('scorePoints')}</span>
                <span className="text-gray-500 dark:text-gray-400">{t('fewerMovesHigherScore')}</span>
              </div>
            </div>

            <Button size="lg" onClick={startGame} className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900">
              {t('startGame')}     
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
