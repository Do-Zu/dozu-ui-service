'use client';

import useFetch from '@/hooks/useFetch';
import type { IFlashcard } from '../../../games/memory-match/types/memory-game.types';
import Flashcard from '../../components/Flashcard';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, Gamepad2, Brain, Home, Settings, PanelLeft } from 'lucide-react';
import StudyControls from '../../components/StudyControls';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import BackButton from '../../components/BackButton';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/utils/constants/routes';
import flashcardService from '@/services/flashcard/flashcard.service';
import toastHelper from '@/utils/toast.helper';
import { cn } from '@/lib/utils';
import Pomodoro from '@/components/pomodoro/Pomodoro';
import useActivePomodoro from '@/hooks/useActivePomodoro';
import DataStatus from '@/components/errors/DataStatus';
import LoadingPage from '@/app/loading';

const initialAutoPlaySpeed = 3;

function getRandomInt(max: number) {
    return Math.floor(Math.random() * (max + 1));
}

function getRandomArray(num: number) {
    const result = [];
    const check = Array(num).fill(false);

    for (let i = 0; i < num; ) {
        const rand = getRandomInt(num - 1);
        if (check[rand]) continue;
        check[rand] = true;
        result.push(rand);
        ++i;
    }
    return result;
}

function getFlashcardsShuffled(flashcards: IFlashcard[]): IFlashcard[] {
    const flashcardsRandom = [];
    const arrayRandom = getRandomArray(flashcards.length);
    for (const indexRandom of arrayRandom) {
        flashcardsRandom.push(flashcards[indexRandom]);
    }
    return flashcardsRandom;
}

export default function Page() {
    const t = useTranslations('flashcard.study');
    const tFlashcardLearning = useTranslations('flashcard.learning');
    const router = useRouter();
    const params = useParams();
    if (!params?.topicId) return <div>No topic id is provided</div>;

    const { topicId } = params as { topicId: string };

    const {
        data: flashcards,
        setData: setFlashcardsData,
        loading: flashcardsLoading,
        error: flashcardsError,
    } = useFetch<IFlashcard[]>(() => flashcardService.getFlashcardsForTopic(topicId));

    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);

    const [isInitialFront, setIsInitialFront] = useState<boolean>(true);
    // const [isFront, setIsFront] = useState<boolean>(isInitialFront);
    const isFrontRef = useRef<boolean>(true);

    // useEffect(() => {
    //     isFrontRef.current = isFront;
    // }, [isFront]);

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(false);
    const [autoPlaySpeed, setAutoPlaySpeed] = useState<number>(initialAutoPlaySpeed);

    const [shuffleEnabled, setShuffleEnabled] = useState<boolean>(false);

    const currentFlashcardIndexRef = useRef<number>(0);

    // modals for images preview
    const [isImagesModalOpen, setIsImagesModalOpen] = useState<boolean>(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    useActivePomodoro();

    function handleBackClick() {
        router.back();
    }

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const { key } = event;
            if (key === 'ArrowLeft') handleClickBackFlashcard();
            else if (key === 'ArrowRight') handleClickNextFlashcard();
            // tìm cách để handle vụ ko lấy thấy được giá trị mới nhất của state isFront khi ko bỏ isFront vào dependencies
            else if (key === 'ArrowUp' || key === 'ArrowDown' || key === ' ') {
                handleManualFlip();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [flashcards, currentFlashcardIndex]);

    useEffect(() => {
        currentFlashcardIndexRef.current = currentFlashcardIndex;
        // setShouldTrackCurrentFlashcard(false);
    }, [currentFlashcardIndex]);

    const flashcardsShuffled = useMemo(() => {
        if (flashcards) return getFlashcardsShuffled(flashcards);
        return null;
    }, [shuffleEnabled]);

    function getCurrentFlashcard(): IFlashcard | null {
        if (shuffleEnabled) {
            return flashcardsShuffled ? flashcardsShuffled[currentFlashcardIndex] : null;
        } else {
            return flashcards ? flashcards[currentFlashcardIndex] : null;
        }
    }

    const currentFlashcard = getCurrentFlashcard();

    const flashcardContainerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (cardRef.current) {
            cardRef.current.style.transform = 'rotateX(0deg)';
            cardRef.current.style.transition = 'transform 0.6s';
        }
    }, [flashcards]);

    function handleSidebarOpenToogle() {
        setIsSidebarOpen(!isSidebarOpen);
    }

    function handleClickBackFlashcard() {
        // chỉnh state isFront thành isFrontRef để ko phụ thuộc vào isFront
        if (!isFrontRef.current) {
            // setIsFront(true);
            isFrontRef.current = true;
            if (cardRef.current) {
                cardRef.current.style.transition = 'none';
                cardRef.current.style.transform = 'rotateX(0deg)';

                handleBackFlashcard();

                setTimeout(() => {
                    if (cardRef.current) cardRef.current.style.transition = 'transform 0.6s';
                }, 100);
            }
        } else {
            handleBackFlashcard();
        }
    }

    function handleClickNextFlashcard() {
        // chỉnh state isFront thành isFrontRef để ko phụ thuộc vào isFront
        if (!isFrontRef.current) {
            // setIsFront(true);
            isFrontRef.current = true;
            if (cardRef.current) {
                cardRef.current.style.transition = 'none';
                cardRef.current.style.transform = 'rotateX(0deg)';

                handleNextFlashcard();

                setTimeout(() => {
                    if (cardRef.current) cardRef.current.style.transition = 'transform 0.6s';
                }, 100);
            }
        } else {
            handleNextFlashcard();
        }
    }

    function handleBackFlashcard() {
        if (currentFlashcardIndex > 0) setCurrentFlashcardIndex((prevIndex) => prevIndex - 1);
    }

    function handleNextFlashcard() {
        if (flashcards && currentFlashcardIndex < flashcards.length - 1)
            setCurrentFlashcardIndex((prevIndex) => prevIndex + 1);
    }

    function handleAutoFlip() {
        if (cardRef.current) {
            cardRef.current.style.transform = 'rotateX(180deg)';
        }
    }

    // không thể lật flashcard khi đang auto
    function handleManualFlip() {
        // if (isFrontRef.current) {
        //   setShouldTrackCurrentFlashcard(true);
        // }

        if (cardRef.current && !autoPlayEnabled) {
            cardRef.current.style.transform = isFrontRef.current ? 'rotateX(180deg)' : 'rotateX(0deg)';
            // setIsFront(prev => !prev);
            isFrontRef.current = !isFrontRef.current;
        }
    }

    function handleClickEditFlashcards() {
        router.push(ROUTES.FLASHCARDS_EDIT(topicId));
    }

    function handleResetProgress() {
        setCurrentFlashcardIndex(0);
    }

    // ver2

    function handleAutoNextFlashcard() {
        if (currentFlashcardIndexRef.current < flashcards!.length - 1) setCurrentFlashcardIndex((prev) => prev + 1);
    }

    function initTask() {
        // if(isFront) handleAutoFlip();
        if (isFrontRef.current) handleAutoFlip();

        return setTimeout(() => {
            if (cardRef.current) {
                cardRef.current.style.transition = 'none';
                cardRef.current.style.transform = 'rotateX(0deg)';

                // handleNextFlashcard();
                handleAutoNextFlashcard();
                if (currentFlashcardIndexRef.current === flashcards!.length - 1) setAutoPlayEnabled(false);

                setTimeout(() => {
                    if (cardRef.current) cardRef.current.style.transition = 'transform 0.6s';
                }, 100);
            }
        }, autoPlaySpeed * 1000);
    }

    function repeatTask() {
        // action 1
        handleAutoFlip();

        return setTimeout(() => {
            if (cardRef.current) {
                // chỉnh về front trước khi chuyển sang flashcard mới
                cardRef.current.style.transition = 'none';
                cardRef.current.style.transform = 'rotateX(0deg)';

                // action 2
                // handleNextFlashcard();
                handleAutoNextFlashcard();
                if (currentFlashcardIndexRef.current === flashcards!.length - 1) setAutoPlayEnabled(false);

                // set lại trạng thái flashcard, cần timeout để lần render sau mới thực thi
                setTimeout(() => {
                    if (cardRef.current) cardRef.current.style.transition = 'transform 0.6s';
                }, 100);
            }
        }, autoPlaySpeed * 1000);
    }

    useEffect(() => {
        if (!autoPlayEnabled) {
            return;
        }

        let mainTimerId: NodeJS.Timeout, intervalId: any;
        let initialTimerId: NodeJS.Timeout;
        let repeatedTimerId: NodeJS.Timeout;

        mainTimerId = setTimeout(
            () => {
                initialTimerId = initTask();
                // repeatTask();
                intervalId = setInterval(
                    () => {
                        repeatedTimerId = repeatTask();
                    },
                    autoPlaySpeed * 1000 * 2,
                );
            },
            isFrontRef.current ? autoPlaySpeed * 1000 : 0,
        );
        // }, autoPlaySpeed * 1000);

        return () => {
            if (cardRef.current) {
                // setIsFront(cardRef.current.style.transform === 'rotateX(0deg)');
                isFrontRef.current = cardRef.current.style.transform === 'rotateX(0deg)';
            }
            clearTimeout(mainTimerId);
            clearTimeout(initialTimerId);
            clearInterval(intervalId);
            clearTimeout(repeatedTimerId);
        };
    }, [autoPlayEnabled, autoPlaySpeed]);

    function handleOnClickLearning() {
        router.push(ROUTES.FLASHCARDS_LEARNING(topicId));
    }

    function handleOnClickGame() {
        router.push(ROUTES.FLASHCARDS_BRAIN_CHASE(topicId));
    }

    function handleOnClickMemoryMatch() {
        router.push(ROUTES.FLASHCARDS_MEMORY_MATCH(topicId));
    }

    function handleAddImageClick(front: string) {
        if (!front) {
            toastHelper.showErrorMessage("This card's front is empty, cannot search images");
            return;
        }
    }

    if (flashcardsError) {
        return (
            <DataStatus
                variant="error"
                title={flashcardsError}
                icon={<BookOpen className="size-10" />}
                className="text-center"
            />
        );
    }

    if (flashcardsLoading === true || flashcards === null || flashcards === undefined) {
        return <LoadingPage isOverlay={true} />;
    }
    if (flashcards.length === 0 || !currentFlashcard) {
        return (
            <DataStatus
                variant="empty"
                title={tFlashcardLearning('flashcardsEmpty')}
                icon={<BookOpen className="size-10" />}
                className="text-center"
            />
        );
    }

    function renderFlashcardButtonsSection(style: string) {
        return (
            <div className={style}>
                <div className="col-start-2 col-end-3 flex flex-row gap-4 items-center">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full"
                        onClick={handleClickBackFlashcard}
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
                        onClick={handleClickNextFlashcard}
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        );
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
                        style="relative flex w-[55%] h-[80%] mt-4"
                        cardContainerRef={flashcardContainerRef}
                        cardRef={cardRef}
                        handleManualFlip={handleManualFlip}
                        flashcard={currentFlashcard}
                    />

                    {renderFlashcardButtonsSection('grid grid-cols-3 mt-4 gap-4')}
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
                        handleResetProgress={handleResetProgress}
                        autoPlaySpeed={autoPlaySpeed}
                        handleAutoPlaySpeedChange={(value) => setAutoPlaySpeed(value[0])}
                        shuffleEnabled={shuffleEnabled}
                        handleShuffleToggle={() => setShuffleEnabled(!shuffleEnabled)}
                        handleEditFlashcardsClick={handleClickEditFlashcards}
                        handleLearningClick={handleOnClickLearning}
                        handleGameClick={handleOnClickGame}
                        handleMemoryMatchClick={handleOnClickMemoryMatch}
                    />
                </aside>
            </div>
        </div>
    );
}
