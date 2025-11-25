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

const initialAutoPlaySpeed = 3;

type FilterType = 'all' | 'starred';
type ViewMode = 'card' | 'list';

export default function BrowseFlashcards() {
    const { topic } = useRequireTopic();
    const { topicId } = topic;
    const { flashcards } = useRequireFlashcards();
    const router = useRouter();

    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);

    const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(false);
    const [autoPlaySpeed, setAutoPlaySpeed] = useState<number>(initialAutoPlaySpeed);

    const [shuffleEnabled, setShuffleEnabled] = useState<boolean>(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);

    // Starred flashcards management
    const [starredFlashcards, setStarredFlashcards] = useState<Set<number>>(new Set());
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('card');

    useActivePomodoro();

    // Load starred flashcards from localStorage on mount
    useEffect(() => {
        const storageKey = `starred_flashcards_${topicId}`;
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved) as number[];
                setStarredFlashcards(new Set(parsed));
            }
        } catch (error) {
            console.error('Error loading starred flashcards:', error);
        }
    }, [topicId]);

    // Save starred flashcards to localStorage whenever it changes
    useEffect(() => {
        const storageKey = `starred_flashcards_${topicId}`;
        try {
            localStorage.setItem(storageKey, JSON.stringify(Array.from(starredFlashcards)));
        } catch (error) {
            console.error('Error saving starred flashcards:', error);
        }
    }, [starredFlashcards, topicId]);

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
            return flashcards.filter((fc) => starredFlashcards.has(fc.flashcardId));
        }
        return flashcards;
    }, [flashcards, filterType, starredFlashcards]);

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
    function handleToggleStar(flashcardId: number) {
        setStarredFlashcards((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(flashcardId)) {
                newSet.delete(flashcardId);
            } else {
                newSet.add(flashcardId);
            }
            return newSet;
        });
    }

    // Reset index when filter changes
    useEffect(() => {
        setCurrentFlashcardIndex(0);
        setIsFlipped(false);
    }, [filterType]);

    // Auto switch to 'all' tab if no starred flashcards and currently on 'starred' tab
    useEffect(() => {
        if (filterType === 'starred' && starredFlashcards.size === 0) {
            setFilterType('all');
        }
    }, [starredFlashcards.size, filterType]);

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
        <div className="flex bg-gray-background w-full h-full">
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
                            'relative bg-gray-100 dark:bg-gray-850 flex flex-col h-full items-center justify-center rounded-lg',
                            'transform-all duration-300 ease-in-out',
                            isSidebarOpen ? 'w-[70%]' : 'w-full',
                        )}
                    >
                        {/* Star button and Volume button */}
                        <div className="absolute top-20 right-8 z-20 flex items-center gap-2">
                            <StarButton
                                isStarred={starredFlashcards.has(currentFlashcard.flashcardId)}
                                onToggle={() => handleToggleStar(currentFlashcard.flashcardId)}
                                size={24}
                                buttonSize="lg"
                            />
                            <VolumeButton 
                                text={isFlipped ? (currentFlashcard?.back || '') : (currentFlashcard?.front || '')} 
                                className="h-10 w-10"
                            />
                        </div>

                        <Flashcard
                            front={currentFlashcard.front}
                            back={currentFlashcard.back}
                            imageUrl={currentFlashcard.imageUrl}
                            isFlipped={isFlipped}
                            isAnimating={isAnimating}
                            onClick={flipWithAnimation}
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

                                <div className="text-base">
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
                            'relative bg-gray-100 dark:bg-gray-850 rounded-lg h-full overflow-y-auto',
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
                                            isStarred={starredFlashcards.has(flashcard.flashcardId)}
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
                                        <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
                                            {/* Front Side - Left */}
                                            <div className="p-6 bg-white dark:bg-gray-800">
                                                <div className="mb-2">
                                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        {index + 1} Front
                                                    </span>
                                                </div>
                                                <div className="text-base text-gray-900 dark:text-foreground whitespace-pre-wrap">
                                                    {flashcard.front}
                                                </div>
                                            </div>

                                            {/* Back Side - Right */}
                                            <div className="p-6 bg-gray-50 dark:bg-gray-900">
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
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
                                                <div className="text-base text-gray-900 dark:text-foreground whitespace-pre-wrap">
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
                        style="bg-gray-100 dark:bg-gray-850 h-full p-6 rounded-lg shadow-sm flex flex-col gap-6 overflow-hidden"
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
