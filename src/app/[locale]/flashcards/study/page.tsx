'use client';

import useFetch from '@/hooks/useFetch';
import Flashcard from '../components/Flashcard';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import StudyControls from '../components/StudyControls';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import BackButton from '../components/BackButton';
import { IFlashcardBasic, IFlashcardStatus } from '../flashcard.type';
import { putRequest } from '@/api/api';

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
    const router = useRouter();
    const searchParamsClient = useSearchParams();
    const topicId = searchParamsClient?.get('topicId')!;

    const flashcardsSelector = (data: { flashcards: IFlashcardsForTopicReturned[] }) => data.flashcards;

    const {
        data: flashcards,
        setData: setFlashcardsData,
        loading: flashcardLoading,
        error: flashcardError,
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
        router.push(`/flashcards/edit?topicId=${topicId}`);
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

    function handleClickPracticeFlashcards() {
        router.push('/flashcards/practice');
    }

    async function handleClickPutToPractice() {
        if (!currentFlashcard) return;
        try {
            await putRequest<{}, {}>(`/flashcards/${currentFlashcard.flashcardId}/put-to-learning`, {});
            const flashcardsUpdated: IFlashcardsForTopicReturned = flashcards!.map((flashcard) => {
                return flashcard.flashcardId === currentFlashcard.flashcardId
                    ? { ...flashcard, status: 'learning' }
                    : flashcard;
            });
            setFlashcardsData(flashcardsUpdated);
        } catch (err) {
            console.log(err);
        }
    }

    if (flashcardLoading === true || flashcards === null || flashcards === undefined) {
        return <div>Loading flashcards...</div>;
    }

    if (flashcards.length === 0 || !currentFlashcard) {
        return <div>No Flashcards to study</div>;
    }

    if (flashcardError) {
        return <div>Something went wrong with Flashcards</div>;
    }

    function renderFlashcardButtonsSection(style: string) {
        const buttonStyle =
            'w-[50px] h-[50px] rounded-full border-none flex justify-center items-center text-[24px] cursor-pointer';
        return (
            <div className={style}>
                <div className="col-start-2 col-end-3 flex flex-row gap-4 items-center">
                    <button onClick={handleClickBackFlashcard} className={`${buttonStyle} bg-[#ffebee] text-[#f44336]`}>
                        X
                    </button>

                    <div>
                        {currentFlashcardIndex + 1} / {flashcards!.length}{' '}
                    </div>

                    <button onClick={handleClickNextFlashcard} className={`${buttonStyle} bg-[#e8f5e9] text-[#4caf50]`}>
                        ✓
                    </button>
                </div>

                {/* if status is 'new', put to practice */}
                {currentFlashcard?.status === 'new' ? (
                    <Button className="w-[75%]" onClick={handleClickPutToPractice}>
                        Put to Practice
                    </Button>
                ) : null}
            </div>
        );
    }

    function renderPracticeSection() {
        return (
            <div className="flex flex-row">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-gray-600 p-0"
                                onClick={handleClickPracticeFlashcards}
                            >
                                <BookOpen className="h-4 w-4 mr-1" />
                                <span className="text-sm text-gray-600">Practice</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Practice Flashcards</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        );
    }

    return (
        <div className="flex bg-[#F3F4F6] h-[90vh]">
            <div className="flex flex-1 flex-col m-1.25 mb-0 p-5">
                <div className="bg-[#fff] p-2.5">
                    <BackButton />
                </div>
                <div className="flex-1 bg-[#F9FAFB] p-5 grid grid-cols-11 gap-5">
                    {/* Main Flashcard Section */}
                    <div className="bg-[#F3F4F6] col-span-8 flex flex-col items-center justify-center">
                        {/* {renderMainFlashcardSection()} */}
                        <Flashcard
                            style="flex w-[55%] h-[70%] mt-4"
                            cardContainerRef={flashcardContainerRef}
                            cardRef={cardRef}
                            handleManualFlip={handleManualFlip}
                            flashcard={currentFlashcard}
                        />

                        {renderFlashcardButtonsSection('grid grid-cols-3 mt-4 gap-4')}
                    </div>

                    {/* Study Control Section */}
                    <StudyControls
                        style="col-span-3 p-6 rounded-lg shadow-sm flex flex-col gap-6 bg-[#F3F4F6]"
                        currentFlashcardIndex={currentFlashcardIndex}
                        flashcardsLength={flashcards.length}
                        handleClickBackFlashcard={handleClickBackFlashcard}
                        handleClickNextFlashcard={handleClickNextFlashcard}
                        isPlaying={isPlaying}
                        handleClickIsPlaying={() => setIsPlaying(!isPlaying)}
                        autoPlayEnabled={autoPlayEnabled}
                        handleOnChangeAutoPlayEnabled={() => setAutoPlayEnabled(!autoPlayEnabled)}
                        handleResetProgress={handleResetProgress}
                        autoPlaySpeed={autoPlaySpeed}
                        handleOnChangeAutoPlaySpeed={(value) => setAutoPlaySpeed(value[0])}
                        shuffleEnabled={shuffleEnabled}
                        handleOnChangeShuffleEnabled={() => setShuffleEnabled(!shuffleEnabled)}
                        handleClickEditFlashcards={handleClickEditFlashcards}
                        CustomElement={renderPracticeSection()}
                    />
                </div>
            </div>
        </div>
    );
}
