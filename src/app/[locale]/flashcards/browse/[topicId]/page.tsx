'use client';

import useFetch from '@/hooks/useFetch';
import Flashcard from '../../components/Flashcard';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, Gamepad2, Brain } from 'lucide-react';
import StudyControls from '../../components/StudyControls';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import BackButton from '../../components/BackButton';
import { IFlashcardBasic, IFlashcardStatus } from '../../types/flashcard.type';
import { putRequest } from '@/api/api';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/utils/constants/routes';

const initialAutoPlaySpeed = 3;

export type IFlashcardForTopic = Omit<IFlashcardBasic, 'topicId'> & { status: IFlashcardStatus };
export type IFlashcardsForTopicReturned = IFlashcardForTopic[];

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

function getFlashcardsShuffled(flashcards: IFlashcardsForTopicReturned): IFlashcardsForTopicReturned {
    const flashcardsRandom = [];
    const arrayRandom = getRandomArray(flashcards.length);
    for (const indexRandom of arrayRandom) {
        flashcardsRandom.push(flashcards[indexRandom]);
    }
    return flashcardsRandom;
}

export default function Page() {
    const t = useTranslations('flashcard.study');
    const router = useRouter();
    const params = useParams();
    if (!params?.topicId) return <div>No topic id is provided</div>;

    const { topicId } = params as { topicId: string };

    const flashcardsSelector = (data: { flashcards: IFlashcardsForTopicReturned[] }) => data.flashcards;

    const {
        data: flashcards,
        setData: setFlashcardsData,
        loading: flashcardsLoading,
        error: flashcardsError,
    } = useFetch<IFlashcardsForTopicReturned>(`/flashcards?topicId=${topicId}`, { selector: flashcardsSelector });

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

    function getCurrentFlashcard(): IFlashcardForTopic | null {
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
    


    if (flashcardsError) {
        return <div>Error: { flashcardsError }</div>;
    }

    if (flashcardsLoading === true || flashcards === null || flashcards === undefined) {
        return <div>Loading flashcards...</div>;
    }

    if (flashcards.length === 0 || !currentFlashcard) {
        return <div>No Flashcards to study</div>;
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

    function renderLearningSection() {
        return (
            <div className="flex flex-row gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleOnClickLearning}>
                                <BookOpen className="h-4 w-4 mr-1" />
                                <span className="text-sm text-muted-foreground">{t('learning')}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Learn Flashcards</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleOnClickGame}>
                                <Gamepad2 className="h-4 w-4 mr-1" />
                                <span className="text-sm text-muted-foreground">Brain Chase</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Play Brain Chase Game</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleOnClickMemoryMatch}>
                                <Brain className="h-4 w-4 mr-1" />
                                <span className="text-sm text-muted-foreground">Memory</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Play Memory Match Game</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-100 dark:bg-gray-950 h-[90vh]">
            <div className="flex flex-1 flex-col m-1.25 mb-0 p-5">
                <div className="bg-white dark:bg-gray-800 p-2.5">
                    <BackButton />
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-5 grid grid-cols-11 gap-5">
                    {/* Main Flashcard Section */}
                    <div className="bg-gray-100 dark:bg-gray-950 col-span-8 flex flex-col items-center justify-center">
                        {/* {renderMainFlashcardSection()} */}
                        <Flashcard
                            style="flex w-[55%] h-[70%] mt-4 "
                            cardContainerRef={flashcardContainerRef}
                            cardRef={cardRef}
                            handleManualFlip={handleManualFlip}
                            flashcard={currentFlashcard}
                        />

                        {renderFlashcardButtonsSection('grid grid-cols-3 mt-4 gap-4')}
                    </div>

                    {/* Study Control Section */}
                    <StudyControls
                        style="col-span-3 p-6 rounded-lg shadow-sm flex flex-col gap-6 bg-gray-100 dark:bg-gray-950 overflow-hidden"
                        currentFlashcardIndex={currentFlashcardIndex}
                        flashcardsLength={flashcards.length}
                        autoPlayEnabled={autoPlayEnabled}
                        handleOnChangeAutoPlayEnabled={() => setAutoPlayEnabled(!autoPlayEnabled)}
                        handleResetProgress={handleResetProgress}
                        autoPlaySpeed={autoPlaySpeed}
                        handleOnChangeAutoPlaySpeed={(value) => setAutoPlaySpeed(value[0])}
                        shuffleEnabled={shuffleEnabled}
                        handleOnChangeShuffleEnabled={() => setShuffleEnabled(!shuffleEnabled)}
                        handleClickEditFlashcards={handleClickEditFlashcards}
                        CustomElement={renderLearningSection()}
                    />
                </div>
            </div>
        </div>
    );
}
