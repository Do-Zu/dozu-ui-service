'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Target, 
  Zap, 
  Trophy
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


  return (
    <div className="space-y-4">
      {/* Current Game Progress */}
      <Card 
        className="bg-card shadow-sm"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t('gameProgress')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>{t('pairsMatched')}</span>
              <span className="font-medium">{stats.matches}/{stats.totalPairs}</span>
            </div>
            <Progress value={getGameProgress()} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-bold text-primary text-xl">{stats.score}</div>
              <div className="text-muted-foreground">{t('score')}</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-bold text-primary text-xl">{stats.moves}</div>
              <div className="text-muted-foreground">{t('moves')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Timer */}
      {(gameStatus === 'playing' || gameStatus === 'paused' || gameStatus === 'completed') && (
        <Card 
          className="bg-card shadow-sm"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              {t('time')} 
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {formatTime(stats.timeElapsed)}
              </div>
              <div className="text-sm text-muted-foreground">
                {gameStatus === 'paused' ? t('paused') : t('elapsed')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Game Tips */}
      {gameStatus === 'playing' && (
        <Card 
          className="bg-muted/50 border shadow-sm"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              {t('tips')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {t2('rememberCardPositions')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {t2('frontCardsAreQuestions')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {t2('backCardsAreAnswers')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {t2('fewerMovesHigherScore')}
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {gameStatus === 'completed' && (
        <Card 
          className="bg-muted/50 border shadow-sm"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              {t('achievements')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-medium mb-1">{t('gameCompleted')}!</div>
              <div className="text-sm text-muted-foreground">
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
