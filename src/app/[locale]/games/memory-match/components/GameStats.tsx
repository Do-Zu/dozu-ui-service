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

export default function GameStats() {
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
    if (accuracy >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (accuracy >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getEfficiencyRating = () => {
    const efficiency = stats.totalPairs > 0 ? (stats.matches / stats.moves) * 100 : 0;
    if (efficiency >= 80) return { text: 'Excellent', color: 'text-green-600' };
    if (efficiency >= 60) return { text: 'Good', color: 'text-yellow-600' };
    if (efficiency >= 40) return { text: 'Fair', color: 'text-orange-600' };
    return { text: 'Keep trying', color: 'text-red-600' };
  };

  return (
    <div className="space-y-4">
      {/* Current Game Progress */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
            <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2 dark:text-gray-200">
              <span>Pairs Matched</span>
              <span className="font-medium">{stats.matches}/{stats.totalPairs}</span>
            </div>
            <Progress value={getGameProgress()} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <div className="font-bold text-purple-600 dark:text-purple-400">{stats.score}</div>
              <div className="text-gray-600 dark:text-gray-400">Score</div>
            </div>
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="font-bold text-blue-600 dark:text-blue-400">{stats.moves}</div>
              <div className="text-gray-600 dark:text-gray-400">Moves</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Timer */}
      {(gameStatus === 'playing' || gameStatus === 'paused' || gameStatus === 'completed') && (
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {formatTime(stats.timeElapsed)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {gameStatus === 'paused' ? 'Paused' : 'Elapsed'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Stats */}
      {stats.moves > 0 && (
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Accuracy */}
            <div className="flex justify-between items-center">
              <span className="text-sm dark:text-gray-200">Accuracy</span>
              <Badge 
                variant="outline" 
                className={`${getAccuracyColor(stats.accuracy)} dark:border-gray-600`}
              >
                {stats.accuracy.toFixed(1)}%
              </Badge>
            </div>

            {/* Efficiency Rating */}
            <div className="flex justify-between items-center">
              <span className="text-sm dark:text-gray-200">Efficiency</span>
              <span className={`text-sm font-medium ${getEfficiencyRating().color}`}>
                {getEfficiencyRating().text}
              </span>
            </div>

            {/* Move efficiency */}
            <div className="flex justify-between items-center">
              <span className="text-sm dark:text-gray-200">Best Possible</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stats.totalPairs * 2} moves
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Tips */}
      {gameStatus === 'playing' && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">•</span>
                Remember card positions after flipping
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">•</span>
                Front cards are questions (Q)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">•</span>
                Back cards are answers (A)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">•</span>
                Fewer moves = higher score!
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {gameStatus === 'completed' && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-medium mb-1">Game Completed!</div>
              <div className="text-sm text-gray-600">
                {stats.accuracy >= 80 ? 'Perfect Memory!' :
                 stats.accuracy >= 60 ? 'Great Job!' :
                 'Well Done!'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
