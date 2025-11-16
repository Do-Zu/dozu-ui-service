'use client';

import { Button } from '@/components/ui/button';
import { Settings, Play, Pause, RefreshCw, ArrowLeft } from 'lucide-react';
import GameArea from '@/app/[locale]/games/brain-chase/components/GameArea';
import QuestionArea from '@/app/[locale]/games/brain-chase/components/QuestionArea';
import Setting from '@/app/[locale]/games/brain-chase/components/Setting';
import { useBrainChase } from '@/app/[locale]/games/brain-chase/context/brainChaseContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';

export default function BrainChaseGame() {
    const t = useTranslations('games.brainChase');
    const { resetGame: resetGameContext } = useTopicWorkspace();
    const {
        gameActive,
        gamePaused,
        togglePause,
        currentQuestion,
        score,
        settings,
        currentQuestionIndex,
        setShowSettings,
        startGame,
        resetGame,
        handleShuffledQuestionGame,
        isLoading,
        loadError,
        topicId,
        topicInfo,
    } = useBrainChase();

    const handleQuit = () => {
        resetGame();
        resetGameContext();
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-muted/20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <h2 className="text-xl font-semibold mb-2">{t('loading')}</h2>
                <p className="text-muted-foreground">{t('loadingMessage')}</p>
            </div>
        );
    }

    // Show error state
    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-muted/20">
                <div className="text-destructive text-6xl mb-4"></div>
                <h2 className="text-xl font-semibold mb-2 text-destructive">{t('errorTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('errorMessage')}</p>
                <Button onClick={() => window.location.reload()}>{t('tryAgain')}</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Game area */}
            <div className="flex-grow relative h-[90%]">
                {gameActive ? (
                    <GameArea />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-muted/20 px-4">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center max-w-4xl leading-tight whitespace-nowrap">
                            {topicId ? t('title') : t('title')}
                        </h1>
                        <p className="text-lg md:text-xl mb-6 text-center max-w-2xl">{t('description')}</p>
                        {topicId && (
                            <p className="text-lg mb-4 text-muted-foreground">
                                Topic: {topicInfo?.name || topicInfo?.title || `ID: ${topicId}`}
                            </p>
                        )}
                        <Button size="lg" onClick={startGame} className="flex items-center gap-2">
                            <Play className="h-5 w-5" />
                            {t('start')}
                        </Button>
                    </div>
                )}

                {/* Game controls */}
                {gameActive && (
                    <div className="absolute top-4 right-4 flex gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => togglePause()}>
                                        {gamePaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="center" className="text-xs px-2 py-1">
                                    {gamePaused ? t('resume') : t('pause')}
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={handleShuffledQuestionGame}>
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="center" className="text-xs px-2 py-1">
                                    {t('gameSettings.shuffleQuestions')}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}

                <div className="absolute top-4 left-4 flex items-center gap-2">
                    {gameActive && (
                        <TooltipProvider delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="hover:text-red-300 transition-colors"
                                        onClick={handleQuit}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="center" className="text-xs px-2 py-1">
                                    {t('quit')}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => setShowSettings()}>
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="center" className="text-xs px-2 py-1">
                                {t('settings')}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Question area */}
            <div className="flex items-center justify-center bg-muted/10 px-4 h-[10%]">
                <QuestionArea
                    question={gameActive ? currentQuestion : ''}
                    currentQuestionNumber={currentQuestionIndex + 1}
                />
            </div>

            {/* Settings modal */}
            <Setting />

            {/* Game over modal */}
            {!gameActive && score > 0 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background p-6 rounded-lg max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">{t('gameOver')}</h2>
                        <p className="mb-4">
                            {t('finalScore')}: {score} {t('of')} {settings.questionCount}
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleQuit}>
                                {t('quit')}
                            </Button>
                            <Button onClick={startGame}>{t('playAgain')}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

