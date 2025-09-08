'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Target, 
  Zap, 
  TrendingUp,
  Trophy,
  Move
} from 'lucide-react';
import { useMemoryMatch } from '../context/MemoryMatchContext';
import { useTranslations } from 'next-intl';

export default function GameStats() {
  const t = useTranslations('games.memoryMatch');
  const t2 = useTranslations('games.memoryMatch.stats');
  const { 
    stats, 
    gameStatus, 
    getGameProgress 
  } = useMemoryMatch();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
    if (accuracy >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
  };

  const getEfficiencyRating = () => {
    const efficiency = stats.totalPairs > 0 ? (stats.matches / stats.moves) * 100 : 0;
    if (efficiency >= 80) return { text: t('excellent'), color: 'text-green-600 dark:text-green-400' };
    if (efficiency >= 60) return { text: t('good'), color: 'text-yellow-600 dark:text-yellow-400' };
    if (efficiency >= 40) return { text: t('fair'), color: 'text-orange-600 dark:text-orange-400' };
    return { text: t('keepTrying'), color: 'text-red-600 dark:text-red-400' };
  };

  return (
    <div className="space-y-4">
      {/* Current Game Progress */}
      <Card className="bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
            <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            {t('gameProgress')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2 dark:text-gray-200">
              <span>{t('pairsMatched')}</span>
              <span className="font-medium">{stats.matches}/{stats.totalPairs}</span>
            </div>
            <Progress value={getGameProgress()} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <div className="font-bold text-purple-600 dark:text-purple-400 text-xl">{stats.score}</div>
              <div className="text-gray-600 dark:text-gray-400">{t('score')}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="font-bold text-blue-600 dark:text-blue-400 text-xl">{stats.moves}</div>
              <div className="text-gray-600 dark:text-gray-400">{t('moves')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Timer */}
      {(gameStatus === 'playing' || gameStatus === 'paused' || gameStatus === 'completed') && (
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {t('time')} 
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {formatTime(stats.timeElapsed)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {gameStatus === 'paused' ? t('paused') : t('elapsed')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Stats */}
      {stats.moves > 0 && (
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              {t('performance')} 
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Accuracy */}
            <div className="flex justify-between items-center">
              <span className="text-sm dark:text-gray-200">{t('accuracy')}</span>
              <Badge
                variant="outline" 
                className={`${getAccuracyColor(stats.accuracy)} dark:border-gray-600`}
              >
                {stats.accuracy.toFixed(1)}%
              </Badge>
            </div>

            {/* Efficiency Rating */}
            <div className="flex justify-between items-center">
              <span className="text-sm dark:text-gray-200">{t('efficiency')}</span>
              <span className={`text-sm font-medium ${getEfficiencyRating().color}`}>
                {getEfficiencyRating().text}
              </span>
            </div>

            {/* Move efficiency */}
            <div className="flex justify-between items-center">
              <span className="text-sm dark:text-gray-200">{t('bestPossible')}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stats.totalPairs * 2} {t('movesUnit')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Tips */}
      {gameStatus === 'playing' && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              {t('tips')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">•</span>
                {t2('rememberCardPositions')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">•</span>
                {t2('frontCardsAreQuestions')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">•</span>
                {t2('backCardsAreAnswers')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">•</span>
                {t2('fewerMovesHigherScore')}
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {gameStatus === 'completed' && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
              <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              {t('achievements')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-medium mb-1 dark:text-gray-100">{t('gameCompleted')}!</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stats.accuracy >= 80 ? t('perfectMemory') :
                 stats.accuracy >= 60 ? t('greatJob') :
                 t('wellDone')  }
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
