'use client';

import type { IFlashcard } from '@/app/[locale]/flashcards/types/flashcard.type';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, PanelLeft, PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/utils/constants/routes';
import { cn } from '@/lib/utils';
import useActivePomodoro from '@/hooks/useActivePomodoro';
import flashcardUtils from '../../../utils/flashcard.utils';
import Flashcard from '../Flashcard';
import { useRequireTopic } from '../../../context/useRequireTopic';
import { useRequireFlashcards } from '../../../context/useRequireFlashcardContent';
import FlashcardsEmptyState from './FlashcardsEmptyState';
import StudyControls from './StudyControls';
import StarButton from '../../../../../../../../components/flashcard/StarButton';
import VolumeButton from '../../../../../../../../components/flashcard/VolumeButton';
import ViewModeToggle from './ViewModeToggle';
import { isListEmpty } from '@/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import flashcardService from '@/services/flashcard/flashcard.service';

const initialAutoPlaySpeed = 3;

type FilterType = 'all' | 'starred';
type ViewMode = 'card' | 'list';

export default function BrowseFlashcards() {
    const { topic } = useRequireTopic();
    const { topicId } = topic;
    const { flashcards, setFlashcards } = useRequireFlashcards();
    const router = useRouter();

    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);

    const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(false);
    const [autoPlaySpeed, setAutoPlaySpeed] = useState<number>(initialAutoPlaySpeed);

    const [shuffleEnabled, setShuffleEnabled] = useState<boolean>(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);

    const [filterType, setFilterType] = useState<FilterType>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('card');

    useActivePomodoro();

    // Get starred flashcards from flashcard data
    const starredFlashcards = useMemo(() => {
        return new Set(flashcards.filter(fc => fc.isStar).map(fc => fc.flashcardId));
    }, [flashcards]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const { key } = event;
            if (key === 'ArrowLeft') handleBackFlashcardClick();
            else if (key === 'ArrowRight') handleNextFlashcardClick();
            // tìm cách để handle vụ ko lấy thấy được giá trị mới nhất của state isFront khi ko bỏ isFront vào dependencies
            else if (key === 'ArrowUp' || key === 'ArrowDown' || key === ' ') {
                flipWithAnimation();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [flashcards, currentFlashcardIndex]);

    const flashcardsShuffled = useMemo(() => {
        return flashcardUtils.getFlashcardsShuffled(flashcards);
    }, [shuffleEnabled]);

    // Filter flashcards based on filter type
    const filteredFlashcards = useMemo(() => {
        if (filterType === 'starred') {
            return flashcards.filter((fc) => fc.isStar === true);
        }
        return flashcards;
    }, [flashcards, filterType]);

    const flashcardsToDisplay = useMemo(() => {
        if (shuffleEnabled) {
            return flashcardUtils.getFlashcardsShuffled(filteredFlashcards);
        }
        return filteredFlashcards;
    }, [filteredFlashcards, shuffleEnabled]);

    const delay = (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    function getCurrentFlashcard(): IFlashcard | undefined {
        return flashcardsToDisplay[currentFlashcardIndex];
    }

    const currentFlashcard = getCurrentFlashcard();

    // Handle star toggle
    async function handleToggleStar(flashcardId: number) {
        try {
            const { flashcardId: updatedFlashcardId, isStar } = await flashcardService.toggleStar(topicId, flashcardId);
            // Update local flashcards state
            setFlashcards((prev) =>
                prev?.map((fc) => (fc.flashcardId === updatedFlashcardId ? { ...fc, isStar } : fc)) ?? []
            );
        } catch (error) {
            console.error('Error toggling star:', error);
        }
    }

    // Reset index when filter changes
    useEffect(() => {
        setCurrentFlashcardIndex(0);
        setIsFlipped(false);
    }, [filterType]);

    // Auto switch to 'all' tab if no starred flashcards and currently on 'starred' tab
    useEffect(() => {
        const hasStarred = flashcards.some(fc => fc.isStar === true);
        if (filterType === 'starred' && !hasStarred) {
            setFilterType('all');
        }
    }, [flashcards, filterType]);

    function handleSidebarOpenToogle() {
        setIsSidebarOpen(!isSidebarOpen);
    }

    function handleBackFlashcardClick() {
        setFlipInstantly(false);
        if (currentFlashcardIndex > 0) setCurrentFlashcardIndex((prevIndex) => prevIndex - 1);
    }

    function handleNextFlashcardClick() {
        setFlipInstantly(false);
        if (currentFlashcardIndex < flashcardsToDisplay.length - 1) setCurrentFlashcardIndex((prevIndex) => prevIndex + 1);
    }

    function flipWithAnimation() {
        if (!autoPlayEnabled) {
            setIsAnimating(true);
            setIsFlipped((prev) => !prev);
        }
    }

    function setFlipWithAnimation(isFlipped: boolean) {
        setIsAnimating(true);
        setIsFlipped(isFlipped);
    }

    function setFlipInstantly(isFlipped: boolean) {
        setIsAnimating(false);
        setIsFlipped(isFlipped);
    }

    function handleEditFlashcardsClick() {
        router.push(ROUTES.FLASHCARDS_EDIT(topicId));
    }

    function resetProgress() {
        setCurrentFlashcardIndex(0);
    }

    function renderCardActions() {
        if (!currentFlashcard) return null;
        
        return (
            <div className="flex items-center gap-2">
                                <StarButton
                                    isStarred={currentFlashcard.isStar === true}
                                    onToggle={() => handleToggleStar(currentFlashcard.flashcardId)}
                                    size={24}
                                    buttonSize="lg"
                                />
                <VolumeButton 
                    text={isFlipped ? (currentFlashcard?.back || '') : (currentFlashcard?.front || '')} 
                    className="h-10 w-10"
                />
            </div>
        );
    }

    useEffect(() => {
        if (!autoPlayEnabled || !flashcardsToDisplay || flashcardsToDisplay.length === 0) return;

        let isStopped = false;

        const runAutoPlay = async () => {
            await delay(autoPlaySpeed * 1000);

            while (!isStopped && currentFlashcardIndex < flashcardsToDisplay.length) {
                setFlipWithAnimation(true);
                await delay(autoPlaySpeed * 1000);

                setFlipInstantly(false);
                setCurrentFlashcardIndex((prev) => {
                    const next = prev + 1;
                    if (next >= flashcardsToDisplay.length) {
                        isStopped = true;
                        setAutoPlayEnabled(false);
                        return prev;
                    }
                    return next;
                });

                await delay(autoPlaySpeed * 1000);
            }
        };

        runAutoPlay();
        return () => {
            isStopped = true;
        };
    }, [autoPlayEnabled, autoPlaySpeed, flashcardsToDisplay.length]);

    if (isListEmpty(flashcards)) {
        return <FlashcardsEmptyState />;
    }


    if (!currentFlashcard) {
        return <FlashcardsEmptyState />;
    }

    return (
        <div className="flex bg-background w-full h-full">
            <div className="relative flex-1 p-5 overflow-hidden">
                {/* Header with tabs and view mode controls */}
                <div className="absolute top-8 left-4 right-4 z-30 flex items-center gap-3 mb-4">
                    <Tabs value={filterType} onValueChange={(value) => setFilterType(value as FilterType)}>
                        <TabsList>
                            <TabsTrigger value="all">Tất cả ({flashcards.length})</TabsTrigger>
                            {starredFlashcards.size > 0 && (
                                <TabsTrigger value="starred">
                                    Gắn dấu sao ({starredFlashcards.size})
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </Tabs>
                    <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            
                </div>

                {/* Sidebar toggle button - Available in all view modes */}
                <div 
                    className={cn(
                        'absolute top-8 z-50 pointer-events-auto transition-all duration-300 ease-in-out',
                        isSidebarOpen ? 'right-[calc(30%+2rem)]' : 'right-8'
                    )}
                >
                    <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={handleSidebarOpenToogle}
                        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                    >
                        <PanelLeft size={18} />
                    </Button>
                </div>

                {/* Card View */}
                {viewMode === 'card' && (
                    <div
                        className={cn(
                            'relative bg-muted flex flex-col h-full items-center justify-center rounded-lg',
                            'transform-all duration-300 ease-in-out',
                            isSidebarOpen ? 'w-[70%]' : 'w-full',
                        )}
                    >
                        <Flashcard
                            front={currentFlashcard.front}
                            back={currentFlashcard.back}
                            imageUrl={currentFlashcard.imageUrl}
                            isFlipped={isFlipped}
                            isAnimating={isAnimating}
                            onClick={flipWithAnimation}
                            topRightActions={renderCardActions()}
                        />

                        <div className="grid grid-cols-3 mt-4 gap-4">
                            <div className="col-start-2 col-end-3 flex flex-row gap-4 items-center">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-full"
                                    onClick={handleBackFlashcardClick}
                                    aria-label="Previous flashcard"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>

                                <div className="text-base text-foreground">
                                    {currentFlashcardIndex + 1} / {flashcardsToDisplay.length}{' '}
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-full"
                                    onClick={handleNextFlashcardClick}
                                    aria-label="Next flashcard"
                                >
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div
                        className={cn(
                            'relative bg-muted rounded-lg h-full overflow-y-auto',
                            'transform-all duration-300 ease-in-out',
                            isSidebarOpen ? 'w-[70%]' : 'w-full',
                        )}
                        style={{ paddingTop: '70px' }}
                    >   
                        <div className="p-6 space-y-4">
                            {flashcardsToDisplay.map((flashcard, index) => (
                                <Card key={flashcard.flashcardId} className="overflow-hidden relative">
                                    {/* Star button and Volume button - Top right corner of the card */}
                                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                                        <StarButton
                                            isStarred={flashcard.isStar === true}
                                            onToggle={() => handleToggleStar(flashcard.flashcardId)}
                                            size={20}
                                            buttonSize="md"
                                        />
                                        <VolumeButton 
                                            text={flashcard.back || flashcard.front || ''} 
                                            className="h-8 w-8"
                                        />
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="grid grid-cols-2 divide-x divide-border">
                                            {/* Front Side - Left */}
                                            <div className="p-6 bg-background">
                                                <div className="mb-2">
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        {index + 1} Front
                                                    </span>
                                                </div>
                                                <div className="text-base text-foreground whitespace-pre-wrap">
                                                    {flashcard.front}
                                                </div>
                                            </div>

                                            {/* Back Side - Right */}
                                            <div className="p-6 bg-muted">
                                                <div className="text-sm font-medium text-muted-foreground mb-2">
                                                    Back
                                                </div>
                                                {flashcard.imageUrl && (
                                                    <div className="mb-3">
                                                        <img
                                                            src={flashcard.imageUrl}
                                                            alt="Flashcard"
                                                            className="w-full h-auto max-h-48 object-contain rounded"
                                                        />
                                                    </div>
                                                )}
                                                <div className="text-base text-foreground whitespace-pre-wrap">
                                                    {flashcard.back}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Study Control Section */}

                <aside
                    className={cn(
                        'absolute top-0 right-0 h-full p-5 w-[30%]',
                        'transform transition-transform duration-300 ease-in-out',
                        isSidebarOpen ? 'translate-x-0' : 'translate-x-full',
                    )}
                >
                    <StudyControls
                        style="bg-muted h-full p-6 rounded-lg shadow-sm flex flex-col gap-6 overflow-hidden"
                        currentFlashcardIndex={currentFlashcardIndex}
                        flashcardsLength={flashcardsToDisplay.length}
                        autoPlayEnabled={autoPlayEnabled}
                        handleAutoPlayToggle={() => setAutoPlayEnabled(!autoPlayEnabled)}
                        handleResetProgress={resetProgress}
                        autoPlaySpeed={autoPlaySpeed}
                        handleAutoPlaySpeedChange={(value) => setAutoPlaySpeed(value[0])}
                        shuffleEnabled={shuffleEnabled}
                        handleShuffleToggle={() => setShuffleEnabled(!shuffleEnabled)}
                        handleEditFlashcardsClick={handleEditFlashcardsClick}
                        isFullScreen={false}
                    />
                </aside>
            </div>
        </div>
    );
}
