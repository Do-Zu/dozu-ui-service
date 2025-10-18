'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { useBrainChase } from '../context/brainChaseContext';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface QuestionAreaProps {
  question: string;
  currentQuestionNumber: number;
}

const QuestionArea = ({ question = '', currentQuestionNumber = 1 }: QuestionAreaProps) => {
  const t = useTranslations('games.brainChase');
  const {
    gameActive,
    gamePaused,
    showSettings,
    score,
    errorsRemaining,
    settings,
    currentQuestionIndex,
    handleNextQuestion,
    flashcards,
      questions,
  } = useBrainChase();

  const [timeRemaining, setTimeRemaining] = useState(settings.timeLimit);
  const [timeProgress, setTimeProgress] = useState(0);
  
  // Calculate total questions based on settings and available questions
  const totalQuestions = (() => {
    const availableQuestions = questions?.length || 0;
    
    // If setting is more than available, use all available
    if (settings.questionCount > availableQuestions) {
      return availableQuestions;
    }
    
    // Otherwise use the set limit
    return settings.questionCount;
  })();
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Restart timer when time limit changes during active game
  const restartTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    setTimeRemaining(settings.timeLimit);
    setTimeProgress(0);
    
    if (gameActive && !gamePaused && !showSettings) {
      handleTimeoutQuestion();
    }
  }, [settings.timeLimit, gameActive, gamePaused, showSettings]);

  useEffect(() => {
    restartTimer();
  }, [restartTimer]);

  const handleTimeoutQuestion = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Reset time states
    setTimeRemaining(settings.timeLimit);
    setTimeProgress(0);

    // Only start a new timer if the game is active and not paused
    if (!gameActive || gamePaused || showSettings) return;

    const startTime = Date.now();
    const totalDuration = settings.timeLimit * 1000;

    timerIntervalRef.current = setInterval(() => {
      // Calculate remaining time based on elapsed time
      const elapsedMs = Date.now() - startTime;
      const remainingSecs = Math.max(0, Math.ceil(totalDuration - elapsedMs) / 1000);

      setTimeRemaining(remainingSecs);
      setTimeProgress((elapsedMs / totalDuration) * 100);

      if (remainingSecs <= 0) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        handleNextQuestion();
      }
    }, 100);
  };

  useEffect(() => {
    // Start/restart timer when question changes
    handleTimeoutQuestion();

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [currentQuestionIndex, settings.timeLimit, gameActive, gamePaused, showSettings]);

  return (
    <div className="w-full h-full bg-background border-t border-border p-4 flex flex-col justify-between">
      {gameActive ? (
        <>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {t('question')} {currentQuestionNumber}/{totalQuestions}
              </span>
              <span className="text-sm font-medium">{t('score')}: {score}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('gameSettings.errorsLeft')} {errorsRemaining}</span>
            </div>
          </div>

          <div className="flex-grow flex items-center justify-center opacity-5 animate-fade-in-up">
            <h2 className={cn('text-xl font-semibold text-center')}>{question}</h2>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>{timeRemaining.toFixed(0)}s</span>
            </div>
            <Progress value={timeProgress} className="h-2" />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">{t('startGameMessage')}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionArea;
