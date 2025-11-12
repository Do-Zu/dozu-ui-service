'use client';

import type { IFlashcard } from '@/app/[locale]/flashcards/types/flashcard.type';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, PanelLeft } from 'lucide-react';
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

const initialAutoPlaySpeed = 3;

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

    useActivePomodoro();

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

    const delay = (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    function getCurrentFlashcard(): IFlashcard {
        if (shuffleEnabled) {
            return flashcardsShuffled[currentFlashcardIndex];
        } else {
            return flashcards[currentFlashcardIndex];
        }
    }

    const currentFlashcard = getCurrentFlashcard();

    function handleSidebarOpenToogle() {
        setIsSidebarOpen(!isSidebarOpen);
    }

    function handleBackFlashcardClick() {
        setFlipInstantly(false);
        if (currentFlashcardIndex > 0) setCurrentFlashcardIndex((prevIndex) => prevIndex - 1);
    }

    function handleNextFlashcardClick() {
        setFlipInstantly(false);
        if (currentFlashcardIndex < flashcards.length - 1) setCurrentFlashcardIndex((prevIndex) => prevIndex + 1);
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
        if (!autoPlayEnabled || !flashcards || flashcards.length === 0) return;

        let isStopped = false;

        const runAutoPlay = async () => {
            await delay(autoPlaySpeed * 1000);

            while (!isStopped && currentFlashcardIndex < flashcards.length) {
                setFlipWithAnimation(true);
                await delay(autoPlaySpeed * 1000);

                setFlipInstantly(false);
                setCurrentFlashcardIndex((prev) => {
                    const next = prev + 1;
                    if (next >= flashcards.length) {
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
    }, [autoPlayEnabled, autoPlaySpeed, flashcards.length]);

    if (flashcards.length === 0) {
        return <FlashcardsEmptyState />;
    }

    return (
        <div className="flex bg-gray-background w-full h-full">
            <div className="relative flex-1 p-5 overflow-hidden">
                {/* Main Flashcard Section */}
                <div
                    className={cn(
                        'relative bg-gray-100 dark:bg-gray-850 flex flex-col h-full items-center justify-center rounded-lg',
                        'transform-all duration-300 ease-in-out',
                        isSidebarOpen ? 'w-[75%]' : 'w-full',
                    )}
                >
                    <div className="absolute top-8 right-8 z-20">
                        <Button size="icon" variant="outline" onClick={handleSidebarOpenToogle}>
                            <PanelLeft size={18} />
                        </Button>
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
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>

                            <div className="text-base">
                                {currentFlashcardIndex + 1} / {flashcards!.length}{' '}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-full"
                                onClick={handleNextFlashcardClick}
                            >
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Study Control Section */}

                <aside
                    className={cn(
                        'absolute top-0 right-0 h-full p-5 w-[25%]',
                        'transform transition-transform duration-300 ease-in-out',
                        isSidebarOpen ? 'translate-x-0' : 'translate-x-full',
                    )}
                >
                    <StudyControls
                        style="bg-gray-100 dark:bg-gray-850 h-full p-6 rounded-lg shadow-sm flex flex-col gap-6 overflow-hidden"
                        currentFlashcardIndex={currentFlashcardIndex}
                        flashcardsLength={flashcards.length}
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
