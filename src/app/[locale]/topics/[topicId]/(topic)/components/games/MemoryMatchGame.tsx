'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, ArrowLeft, Trophy, Clock, Target, Zap, BarChart3 } from 'lucide-react';
import { useMemoryMatch } from '@/app/[locale]/games/memory-match/context/MemoryMatchContext';
import MemoryGameBoard from '@/app/[locale]/games/memory-match/components/MemoryGameBoard';
import GameStatsModal from '@/app/[locale]/games/memory-match/components/GameStatsModal';
import { useTranslations } from 'next-intl';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';

export default function MemoryMatchGame() {
    const t = useTranslations('games.memoryMatch');
    const t1 = useTranslations('games.common');
    const [showStats, setShowStats] = useState(false);
    const { resetGame: resetGameContext } = useTopicWorkspace();

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

    const handleQuit = () => {
        resetGame();
        resetGameContext();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <h2 className="text-xl font-semibold mb-2 text-foreground">{t('loading')}</h2>
                <p className="text-muted-foreground">{t('loadingMessage')}</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-background">
                <div className="text-destructive text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold mb-2 text-destructive">{t('errorTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('errorMessage')}</p>
                <div className="flex gap-2">
                    <Button onClick={() => window.location.reload()} variant="outline">
                        {t('tryAgain')}
                    </Button>
                    <Button onClick={handleQuit}>{t('backToTopic')}</Button>
                </div>
            </div>
        );
    }

    // Game failed (no flashcards)
    if (gameStatus === 'failed') {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-background">
                <div className="text-yellow-500 text-6xl mb-4">🎯</div>
                <h2 className="text-xl font-semibold mb-2 text-foreground">{t('errorTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('errorMessage')}</p>
                <Button onClick={handleQuit}>{t('backToTopic')}</Button>
            </div>
        );
    }

    // Check if in fullscreen game mode
    const isFullscreenGame = gameStatus === 'playing' || gameStatus === 'paused' || gameStatus === 'completed';

    // Fullscreen game layout
    if (isFullscreenGame) {
        return (
            <>
                <div className="relative w-full h-full bg-background overflow-hidden">
                    {/* Floating control bar */}
                    <div className="absolute top-4 left-4 right-4 z-20 flex justify-center items-center pointer-events-none">
                        <div className="flex items-center gap-4 bg-background/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border pointer-events-auto">
                            <Button variant="outline" size="sm" onClick={handleQuit} className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                {t('back')}
                            </Button>

                            <div className="h-4 w-px bg-border"></div>

                            <Badge variant="outline">
                                {gameStatus === 'playing'
                                    ? t('playing')
                                    : gameStatus === 'paused'
                                      ? t('paused')
                                      : gameStatus === 'completed'
                                        ? t('completed')
                                        : gameStatus}
                            </Badge>

                            <Badge variant="secondary" className="gap-1">
                                <Clock className="h-3 w-3" />
                                {Math.floor(stats.timeElapsed / 60)}:{(stats.timeElapsed % 60).toString().padStart(2, '0')}
                            </Badge>

                            <div className="h-4 w-px bg-border"></div>

                            {/* Game controls */}
                            <div className="flex gap-2">
                                {gameStatus === 'playing' && (
                                    <Button variant="outline" size="sm" onClick={pauseGame}>
                                        <Pause className="h-4 w-4" />
                                    </Button>
                                )}
                                {gameStatus === 'paused' && (
                                    <Button variant="outline" size="sm" onClick={resumeGame}>
                                        <Play className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={resetGame}>
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="h-4 w-px bg-border"></div>

                            {/* Stats Toggle Button */}
                            <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)} className="gap-2">
                                <BarChart3 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Main Content Area - with padding to avoid control bar */}
                    <div className="relative w-full h-full bg-background pt-20">
                        <div className="flex h-full">
                            <div className="flex items-center justify-center px-4 w-full flex-1 min-h-0 pb-4">
                                <div className="w-full max-w-4xl h-full">
                                    <MemoryGameBoard />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Game Completed Modal */}
                    {gameStatus === 'completed' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                            <Card className="w-full max-w-md mx-4 bg-background shadow-2xl">
                                <CardContent className="p-6 text-center">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h2 className="text-2xl font-bold mb-4">{t('congratulations')}</h2>
                                    <p className="text-muted-foreground mb-6">
                                        {t('completedAllPairs', { pairs: stats.totalPairs })}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                        <div className="bg-muted p-3 rounded-lg border">
                                            <div className="font-medium text-primary text-lg">{stats.score}</div>
                                            <div className="text-muted-foreground">{t('finalScore')}</div>
                                        </div>
                                        <div className="bg-muted p-3 rounded-lg border">
                                            <div className="font-medium text-primary text-lg">{stats.moves}</div>
                                            <div className="text-muted-foreground">{t('totalMoves')}</div>
                                        </div>
                                        <div className="bg-muted p-3 rounded-lg border">
                                            <div className="font-medium text-primary text-lg">
                                                {Math.floor(stats.timeElapsed / 60)}:
                                                {(stats.timeElapsed % 60).toString().padStart(2, '0')}
                                            </div>
                                            <div className="text-muted-foreground">{t('time')}</div>
                                        </div>
                                        <div className="bg-muted p-3 rounded-lg border">
                                            <div className="font-medium text-primary text-lg">
                                                {stats.accuracy.toFixed(1)}%
                                            </div>
                                            <div className="text-muted-foreground">{t('accuracy')}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={resetGame} className="flex-1">
                                            {t('playAgain')}
                                        </Button>
                                        <Button onClick={handleQuit} className="flex-1">
                                            {t1('backToFlashcards')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Game Stats Modal */}
                <GameStatsModal isOpen={showStats} onOpenChange={setShowStats} />
            </>
        );
    }

    // Start screen layout (normal layout)
    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 p-4">
                <div className="max-w-6xl mx-auto w-full flex flex-col flex-1 min-h-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" onClick={handleQuit} className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                {t('back')}
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
                                {topicInfo && (
                                    <p className="text-muted-foreground mt-1">
                                        Topic: {topicInfo.name || topicInfo.title || 'Unknown'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="gap-1">
                                <Target className="h-3 w-3" />
                                {stats.totalPairs} {t('pairs')}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                                <Trophy className="h-3 w-3" />
                                {t('score')}: {stats.score}
                            </Badge>
                        </div>
                    </div>

                    {/* Game Progress */}
                    <div className="mb-4 flex-shrink-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{t('gameProgress')}</span>
                            <span className="text-sm text-muted-foreground">
                                {stats.matches}/{stats.totalPairs} {t('pairs')} {t('matched')}
                            </span>
                        </div>
                        <Progress value={getGameProgress()} className="h-2" />
                    </div>

                    {/* Start screen content */}
                    <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                        <div className="text-center max-w-lg">
                            <div className="text-6xl mb-4">🧠</div>
                            <p className="text-lg text-muted-foreground mb-4">{t('description')}</p>

                            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                                <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border">
                                    <Clock className="h-6 w-6 text-muted-foreground mb-2" />
                                    <span className="font-medium">{t('quickMemory')}</span>
                                    <span className="text-muted-foreground text-xs">{t('rememberPositions')}</span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border">
                                    <Target className="h-6 w-6 text-muted-foreground mb-2" />
                                    <span className="font-medium">{t('findPairs')}</span>
                                    <span className="text-muted-foreground text-xs">{t('matchFrontBack')}</span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border">
                                    <Zap className="h-6 w-6 text-muted-foreground mb-2" />
                                    <span className="font-medium">{t('scorePoints')}</span>
                                    <span className="text-muted-foreground text-xs">{t('fewerMovesHigherScore')}</span>
                                </div>
                            </div>

                            <Button size="lg" onClick={startGame}>
                                {t('startGame')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Stats Modal */}
            <GameStatsModal isOpen={showStats} onOpenChange={setShowStats} />
        </div>
    );
}

