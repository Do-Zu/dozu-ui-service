'use client';

import { useEffect, useRef, useState } from 'react';
import Flashcard from '../components/Flashcard';
import { Angry, ArrowBigLeft, CircleAlert, Eye, Frown, Laugh, Smile, ThumbsUp } from 'lucide-react';
import { Label } from '@/components/ui/label';
import useFetch from '@/hooks/useFetch';
import { Button } from '@/components/ui/button';
import { putRequest } from '@/api/api';
import BackButton from '../components/BackButton';
import { IFlashcardFull, IQualityResponse, IQualityResponseNextReviewInterval } from '../flashcard.type';
import { useTranslations } from 'next-intl';
import LoadingPage from '@/app/loading';

type TrackingOption = {
    icon: any;
    label: string;
    qualityResponse: IQualityResponse;
};

export type IFlashcard = Pick<IFlashcardFull, 'flashcardId' | 'front' | 'back' | 'topicName'> & {
    qualityResponsesNextReviewInterval: IQualityResponseNextReviewInterval[];
};

export default function Page() {
    const topicT = useTranslations('topic');
    const flashcardT = useTranslations('flashcard.practice');

    const trackingOptions: TrackingOption[] = [
        { icon: <Angry size={24} fill="red" />, label: flashcardT('responseOptions.blackout'), qualityResponse: 0 },
        { icon: <Frown size={24} fill="#F6C908" />, label: flashcardT('responseOptions.wrong'), qualityResponse: 1 },
        {
            icon: <CircleAlert size={24} fill="#FFCC4D" />,
            label: flashcardT('responseOptions.wrongEasy'),
            qualityResponse: 2,
        },
        { icon: <ThumbsUp size={24} fill="blue" />, label: flashcardT('responseOptions.hard'), qualityResponse: 3 },
        { icon: <Smile size={24} fill="yellow" />, label: flashcardT('responseOptions.good'), qualityResponse: 4 },
        { icon: <Laugh size={24} fill="yellow" />, label: flashcardT('responseOptions.perfect'), qualityResponse: 5 },
    ];

    const {
        data: flashcards,
        setData: setFlashcardsData,
        loading: flashcardLoading,
        error: flashcardError,
    } = useFetch<IFlashcard[]>('/flashcards/practice');

    const currentFlashcard = flashcards ? flashcards[0] : null;

    const flashcardContainerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const isFrontRef = useRef<boolean>(true);

    const [shouldShowTrackingOptions, setShouldShowTrackingOptions] = useState<boolean>(false);

    // useEffect(() => {
    //     if(cardRef.current) {
    //         cardRef.current.style.transform = 'rotateX(0deg)';
    //         cardRef.current.style.transition = 'transform 0.6s';
    //     }
    // }, []);

    useEffect(() => {
        isFrontRef.current = true;
        if (cardRef.current) {
            cardRef.current.style.transition = 'none';
            cardRef.current.style.transform = 'rotateX(0deg)';

            setTimeout(() => {
                if (cardRef.current) cardRef.current.style.transition = 'transform 0.6s';
            }, 100);
        }
        setShouldShowTrackingOptions(false);
    }, [flashcards]);

    function handleManualFlip() {
        if (isFrontRef.current) {
            setShouldShowTrackingOptions(true);
        } else {
            return;
        }

        // if(cardRef.current && !autoPlayEnabled) {
        if (cardRef.current) {
            cardRef.current.style.transform = isFrontRef.current ? 'rotateX(180deg)' : 'rotateX(0deg)';
            // setIsFront(prev => !prev);
            isFrontRef.current = !isFrontRef.current;
        }
    }

    function renderTrackingOptionsSection(style: string) {
        return (
            <div className={style}>
                {trackingOptions.map((option, index) => {
                    const nextReviewInterval = currentFlashcard?.qualityResponsesNextReviewInterval.find(
                        (element) => element.qualityResponse === option.qualityResponse,
                    )?.nextReviewInterval;

                    return (
                        <div
                            key={index}
                            className="col-span-2 h-full flex flex-col gap-0 justify-center items-center rounded-lg bg-white dark:bg-gray-800 cursor-pointer"
                            onClick={() => handleClickTrackingOption(option.qualityResponse)}
                        >
                            {option.icon}
                            <Label className="text-lg">{option.label}</Label>
                            <Label className="text-sm text-foreground">
                                {nextReviewInterval} {nextReviewInterval === 1 ? 'day' : 'days'}
                            </Label>
                        </div>
                    );
                })}
            </div>
        );
    }

    function renderShowAnswerSection(style: string) {
        return (
            <div className={style}>
                <Button onClick={handleManualFlip} className="flex flex-row items-center">
                    <Eye />
                    <div>{flashcardT('showAnswer')}</div>
                </Button>
            </div>
        );
    }

    async function handleClickTrackingOption(qualityResponse: 0 | 1 | 2 | 3 | 4 | 5) {
        if (!flashcards || !currentFlashcard) return;
        try {
            await putRequest(`/flashcards/${currentFlashcard.flashcardId}/track`, { qualityResponse });
            const flashcardsFiltered = flashcards.slice(1);
            setFlashcardsData(flashcardsFiltered);
        } catch (err) {
            console.log(err);
        }
    }

    if (flashcardLoading === true || flashcards === null || flashcards === undefined) {
        return <LoadingPage />
    }

    if (flashcards.length === 0 || !currentFlashcard) {
        return <div>Nothing to Practice</div>;
    }

    if (flashcardError) {
        return <div>Something went wrong with Flashcards</div>;
    }

    // console.log('Flashcards: ', flashcards);
    return (
        <div className="flex bg-gray-100 dark:bg-gray-950 h-[95vh]">
            <div className="flex flex-1 flex-col m-1.25 mb-0 p-5">
                <div className="bg-white dark:bg-gray-800 p-2.5">
                    <BackButton />
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-5 grid grid-cols-11 gap-5">
                    <div className="bg-gray-100 dark:bg-gray-950 col-span-11 flex flex-col items-center">
                        <div className="w-[50%] flex flex-row justify-between mt-6">
                            <div className="text-foreground">
                                {topicT('topic')}
                                <span> {currentFlashcard.topicName}</span>
                            </div>
                            <div className="text-foreground">
                                <span>{flashcards.length} </span>
                                {flashcardT('flashcardsRemaining')}
                            </div>
                        </div>
                        <Flashcard
                            style="flex w-[50%] h-[75%] mt-2"
                            cardContainerRef={flashcardContainerRef}
                            cardRef={cardRef}
                            flashcard={currentFlashcard}
                        />
                        {shouldShowTrackingOptions
                            ? renderTrackingOptionsSection('grid grid-cols-12 gap-6 mt-2 mt-4 mb-4 w-[70%] h-[20%]')
                            : renderShowAnswerSection('mt-4')}
                    </div>
                </div>
            </div>
        </div>
    );
}
