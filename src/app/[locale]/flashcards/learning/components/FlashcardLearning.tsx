import { useTranslations } from 'next-intl';
import BackButton from '../../components/BackButton';
import { IFlashcardFull, IQualityResponse, IQualityResponseNextReviewInterval } from '../../types/flashcard.type';
import Flashcard from '../../components/Flashcard';
import { Angry, CircleAlert, Eye, Frown, Laugh, Smile, ThumbsUp } from 'lucide-react';
import { putRequest } from '@/api/api';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import React from 'react';

export type IFlashcard = Pick<IFlashcardFull, 'flashcardId' | 'front' | 'back' | 'topicName'> & {
    qualityResponsesNextReviewInterval: IQualityResponseNextReviewInterval[];
};

type TrackingOption = {
    icon: any;
    label: string;
    qualityResponse: IQualityResponse;
};

interface Props {
    topicName: string;
    flashcard: IFlashcard;
    total: number;
    flashcardContainerRef: React.RefObject<HTMLDivElement>;
    cardRef: React.RefObject<HTMLDivElement>;
    isFrontRef: React.RefObject<boolean>;
    shouldShowTrackingOptions: boolean;
    handleManualFlip: () => void;
    handleOnClickTrackingOption: (qualityResponse: IQualityResponse) => void;
}

export function FlashcardLearning({
    topicName,
    flashcard,
    total,
    flashcardContainerRef,
    cardRef,
    shouldShowTrackingOptions,
    handleManualFlip,
    handleOnClickTrackingOption,
}: Props) {
    const topicT = useTranslations('topic');
    const flashcardT = useTranslations('flashcard.learning');

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

    function renderTrackingOptionsSection(style: string) {
        return (
            <div className={style}>
                {trackingOptions.map((option, index) => {
                    const nextReviewInterval = flashcard?.qualityResponsesNextReviewInterval.find(
                        (element) => element.qualityResponse === option.qualityResponse,
                    )?.nextReviewInterval;

                    return (
                        <div
                            key={index}
                            className="col-span-2 h-full flex flex-col gap-0 justify-center items-center rounded-lg bg-white dark:bg-gray-800 cursor-pointer"
                            onClick={() => handleOnClickTrackingOption(option.qualityResponse)}
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
                                <span> {topicName}</span>
                            </div>
                            <div className="text-foreground">
                                <span>{total} </span>
                                {flashcardT('flashcardsRemaining')}
                            </div>
                        </div>
                        <Flashcard
                            style="flex w-[50%] h-[75%] mt-2"
                            cardContainerRef={flashcardContainerRef}
                            cardRef={cardRef}
                            flashcard={flashcard}
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
