import { useTranslations } from 'next-intl';
import BackButton from '../../components/BackButton';
import { IAnkiRating, IDueAnkiCard, IFlashcard, IQualityResponseNextReviewInterval } from '../../types/flashcard.type';
import Flashcard from '../../components/Flashcard';
import { Angry, CircleAlert, Eye, Frown, Laugh, Smile, ThumbsUp } from 'lucide-react';
import { putRequest } from '@/api/api';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { IQualityResponse } from '@/types/itemSpacedRepetitionTracking.type';
import { IFlashcardStatusCounts, IFlashcardWithReviewPrediction } from '../[topicId]/page';
import { useLearningOptions } from '../hooks/useLearningOptions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import flashcardHelper from '@/utils/flashcard/flashcard.helper';

// type TrackingOption = {
//     icon: any;
//     label: string;
//     qualityResponse: IQualityResponse;
// };

interface Props {
    topicName: string;
    flashcard: IDueAnkiCard;
    total: number;
    flashcardContainerRef: React.RefObject<HTMLDivElement>;
    cardRef: React.RefObject<HTMLDivElement>;
    isFrontRef: React.RefObject<boolean>;
    shouldShowTrackingOptions: boolean;
    handleManualFlip: () => void;
    // handleOnClickTrackingOption: (qualityResponse: IQualityResponse) => void;
    handleLearningOptionClick: (rating: IAnkiRating) => void;
    flashcardStatusCounts: IFlashcardStatusCounts;
}

export function FlashcardLearning({
    topicName,
    flashcard,
    total,
    flashcardContainerRef,
    cardRef,
    shouldShowTrackingOptions,
    handleManualFlip,
    handleLearningOptionClick,
    flashcardStatusCounts,
}: Props) {
    const tTopic = useTranslations('topic');
    const tFlashcard = useTranslations('flashcard.learning');

    const learningOptions = useLearningOptions();

    // const trackingOptions: TrackingOption[] = [
    //     { icon: <Angry size={24} fill="red" />, label: flashcardT('responseOptions.blackout'), qualityResponse: 0 },
    //     { icon: <Frown size={24} fill="#F6C908" />, label: flashcardT('responseOptions.wrong'), qualityResponse: 1 },
    //     {
    //         icon: <CircleAlert size={24} fill="#FFCC4D" />,
    //         label: flashcardT('responseOptions.wrongEasy'),
    //         qualityResponse: 2,
    //     },
    //     { icon: <ThumbsUp size={24} fill="blue" />, label: flashcardT('responseOptions.hard'), qualityResponse: 3 },
    //     { icon: <Smile size={24} fill="yellow" />, label: flashcardT('responseOptions.good'), qualityResponse: 4 },
    //     { icon: <Laugh size={24} fill="yellow" />, label: flashcardT('responseOptions.perfect'), qualityResponse: 5 },
    // ];

    useEffect(() => {
        function handleKeyShortcut(event: KeyboardEvent) {
            const { key } = event;
            const keyToRating: Record<string, IAnkiRating> = {
                [IAnkiRating.AGAIN.toString()]: IAnkiRating.AGAIN,
                [IAnkiRating.HARD.toString()]: IAnkiRating.HARD,
                [IAnkiRating.GOOD.toString()]: IAnkiRating.GOOD,
                [IAnkiRating.EASY.toString()]: IAnkiRating.EASY,
            };

            if (key in keyToRating) {
                handleLearningOptionClick(keyToRating[key]);
            }

            if (key === 'Enter' || key === ' ') {
                handleManualFlip();
            }
        }

        window.addEventListener('keydown', handleKeyShortcut);

        return () => {
            window.removeEventListener('keydown', handleKeyShortcut);
        };
    }, [handleLearningOptionClick, handleManualFlip]);

    return (
        <div className="flex bg-gray-background w-full h-full">
            <div className="relative flex-1 p-5 overflow-hidden">
                <div className="relative bg-gray-100 dark:bg-gray-850 flex flex-col h-full items-center justify-center rounded-lg">
                    <Flashcard
                        style={`flex w-[55%] mt-2 ${shouldShowTrackingOptions ? 'h-[70%]' : 'h-[80%]'}`}
                        cardContainerRef={flashcardContainerRef}
                        cardRef={cardRef}
                        flashcard={flashcard}
                    />
                    {shouldShowTrackingOptions ? (
                        <div className="grid grid-cols-12 gap-6 mt-4 w-[55%] h-[18%]">
                            {learningOptions.map((option, index) => {
                                // const nextReviewInterval = flashcard?.qualityResponsesNextReviewInterval.find(
                                //     (element) => element.qualityResponse === option.qualityResponse,
                                // )?.nextReviewInterval;
                                const nextReviewSchedule = flashcard.nextReviewSchedule;
                                const nextReviewIntervalForRating =
                                    nextReviewSchedule.nextReviewIntervalsForRating.find(
                                        (e) => e.rating === option.rating,
                                    );
                                if (!nextReviewIntervalForRating) {
                                    return <>Rating not found</>;
                                }
                                const intervalFormatted = flashcardHelper.formatInterval(
                                    nextReviewIntervalForRating.interval,
                                );

                                return (
                                    <TooltipProvider key={index}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="col-span-3 h-full flex flex-col gap-0 justify-center items-center rounded-lg bg-white dark:bg-gray-700 cursor-pointer"
                                                    onClick={() => handleLearningOptionClick(option.rating)}
                                                >
                                                    {option.icon}
                                                    <Label className="text-lg">{option.label}</Label>
                                                    <Label className="text-sm text-foreground">
                                                        {intervalFormatted}
                                                    </Label>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>Key shortcut: {option.rating} </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-4 w-[55%] flex flex-col items-center gap-3">
                            <div className="flex gap-3">
                                <TooltipProvider>
                                    {/* New */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 cursor-default">
                                                <span
                                                    className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-300"
                                                    aria-hidden
                                                />
                                                <span>{flashcardStatusCounts.new}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">New cards</TooltipContent>
                                    </Tooltip>

                                    {/* Learning */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 cursor-default">
                                                <span
                                                    className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-300"
                                                    aria-hidden
                                                />
                                                <span>{flashcardStatusCounts.learning}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">Learning cards</TooltipContent>
                                    </Tooltip>

                                    {/* Review */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 cursor-default">
                                                <span
                                                    className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-300"
                                                    aria-hidden
                                                />
                                                <span>{flashcardStatusCounts.review}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">Review cards</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <div className="w-full flex justify-center">
                                <Button
                                    onClick={handleManualFlip}
                                    className="flex flex-row items-center bg-white dark:bg-gray-700 text-black dark:text-white"
                                >
                                    <Eye className="text-foreground w-4 h-4 mr-2" />
                                    <div className="text-foreground">{tFlashcard('showAnswer')}</div>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
