'use client';

import React from 'react';
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
  Zap
} from 'lucide-react';
import { useMemoryMatch } from '../context/MemoryMatchContext';
import MemoryGameBoard from './MemoryGameBoard';
import GameStats from './GameStats';
import { useTranslations } from 'next-intl';

export default function MemoryMatchGame() {
  const t = useTranslations('games.memoryMatch');
  const router = useRouter();
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
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-300">Memory Match</h1>
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
              {stats.totalPairs} Pairs
            </Badge>
            <Badge variant="outline" className="gap-1 dark:border-gray-600 dark:text-gray-200">
              <Trophy className="h-3 w-3" />
              Score: {stats.score}
            </Badge>
          </div>
        </div>

        {/* Game Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium dark:text-gray-200">Game Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stats.matches}/{stats.totalPairs} pairs matched
            </span>
          </div>
          <Progress value={getGameProgress()} className="h-2" />
        </div>

        {/* Game Content */}
        {gameStatus === 'ready' || gameStatus === 'idle' ? (
          // Start screen
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-center max-w-lg">
              <div className="text-6xl mb-6">🧠</div>
              <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Memory Match Challenge</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Flip cards to find matching pairs. Match the front and back of each flashcard!
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                  <span className="font-medium dark:text-gray-100">Quick Memory</span>
                  <span className="text-gray-500 dark:text-gray-400">Remember positions</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Target className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                  <span className="font-medium dark:text-gray-100">Find Pairs</span>
                  <span className="text-gray-500 dark:text-gray-400">Match front & back</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Zap className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                  <span className="font-medium dark:text-gray-100">Score Points</span>
                  <span className="text-gray-500 dark:text-gray-400">Fewer moves = higher score</span>
                </div>
              </div>

              <Button size="lg" onClick={startGame} className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900">
                <Play className="h-5 w-5 mr-2" />
                Start Game
              </Button>
            </div>
          </div>
        ) : (
          // Game area
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Game Board */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {gameStatus === 'playing' ? 'Playing' : 
                         gameStatus === 'paused' ? 'Paused' : 
                         gameStatus === 'completed' ? 'Completed' : gameStatus}
                      </Badge>
                      {gameStatus === 'playing' && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.floor(stats.timeElapsed / 60)}:
                          {(stats.timeElapsed % 60).toString().padStart(2, '0')}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {gameStatus === 'playing' && (
                        <Button variant="outline" size="sm" onClick={() => {
                          pauseGame();
                        }} className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {gameStatus === 'paused' && (
                        <Button variant="outline" size="sm" onClick={() => {

                          resumeGame();
                        }} className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={resetGame} className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <MemoryGameBoard />
                </CardContent>
              </Card>
            </div>

            {/* Stats Panel */}
            <div className="lg:col-span-1">
              <GameStats />
            </div>
          </div>
        )}

        {/* Game Completed Modal */}
        {gameStatus === 'completed' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 bg-white dark:bg-gray-800">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Congratulations!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You completed all {stats.totalPairs} pairs!
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="font-medium text-purple-600 dark:text-purple-400">{stats.score}</div>
                    <div className="text-gray-500 dark:text-gray-400">Final Score</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="font-medium text-purple-600 dark:text-purple-400">{stats.moves}</div>
                    <div className="text-gray-500 dark:text-gray-400">Total Moves</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="font-medium text-purple-600 dark:text-purple-400">
                      {Math.floor(stats.timeElapsed / 60)}:{(stats.timeElapsed % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Time</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="font-medium text-purple-600 dark:text-purple-400">
                      {stats.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Accuracy</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetGame} className="flex-1 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                    Play Again
                  </Button>
                  <Button onClick={() => router.back()} className="flex-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
                    Back to Flashcards
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
