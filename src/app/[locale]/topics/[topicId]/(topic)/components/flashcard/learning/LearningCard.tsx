import { useLearningOptions } from '@/app/[locale]/topics/[topicId]/(topic)/hooks/useLearningOptions';
import { IAnkiCardStatusCounts, IDueAnkiCard } from '@/app/[locale]/flashcards/types/flashcard.type';
import useActivePomodoro from '@/hooks/useActivePomodoro';
import { IAnkiRating } from '@/types/anki';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import Flashcard from '../Flashcard';
import flashcardHelper from '@/utils/flashcard/flashcard.helper';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import flashcardService from '@/services/flashcard/flashcard.service';
import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';
import FlashcardsPanelControls from '../node/FlashcardsPanelControls';

interface Props {
    flashcard: IDueAnkiCard;
    ankiSetting: IAnkiSetting;
    shouldShowTrackingOptions: boolean;
    isFlipped: boolean;
    isAnimating: boolean;
    onFlip: () => void;
    handleRatingClick: (rating: IAnkiRating) => void;
    flashcardStatusCounts: IAnkiCardStatusCounts;
    onClose?: () => void;
    isPanelFullscreen?: boolean;
    onPanelToggle?: () => void;
    label?: string;
}

export default function LearningCard({
    flashcard,
    ankiSetting,
    shouldShowTrackingOptions,
    isFlipped,
    isAnimating,
    onFlip,
    handleRatingClick,
    flashcardStatusCounts,
    onClose,
    isPanelFullscreen,
    onPanelToggle,
    label,
}: Props) {
    const tFlashcard = useTranslations('flashcard.learning');

    const learningOptions = useLearningOptions();

    useActivePomodoro();

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
                handleRatingClick(keyToRating[key]);
            }

            if (key === 'Enter' || key === ' ') {
                onFlip();
            }
        }

        window.addEventListener('keydown', handleKeyShortcut);

        return () => {
            window.removeEventListener('keydown', handleKeyShortcut);
        };
    }, [handleRatingClick, onFlip]);

    return (
        <div className="flex bg-gray-background w-full h-full">
            <div className="relative flex-1 p-5 overflow-hidden">
                <div className="relative bg-gray-100 dark:bg-gray-850 flex flex-col h-full items-center justify-center rounded-lg">
                    <div className="w-full flex justify-end px-4 mt-5">
                        <FlashcardsPanelControls
                            onClose={onClose}
                            isFullscreen={isPanelFullscreen}
                            onPanelToggle={onPanelToggle}
                        />
                    </div>
                    {label ? (
                        <div className="w-full max-w-xl text-center mb-4 mt-[-1rem]">
                            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                                {label}
                            </span>
                        </div>
                    ) : null}
                    <Flashcard
                        front={flashcard.front}
                        back={flashcard.back}
                        imageUrl={flashcard.imageUrl}
                        isFlipped={isFlipped}
                        isAnimating={isAnimating}
                        onClick={onFlip}
                    />
                    {shouldShowTrackingOptions ? (
                        <div className="grid grid-cols-12 gap-4 mt-4 w-[70%] h-[18%] mb-2">
                            {learningOptions.map((option, index) => {
                                // Get the interval list if available, otherwise the array is empty
                                const intervals = flashcardService.getNextReviewByRatings(
                                    flashcard.flashcardId,
                                    flashcard.learningState,
                                    ankiSetting,
                                );

                                // Find interval by current rating (can be undefined)
                                const found = intervals.find((i) => i.rating === option.rating);

                                // Display label: if data is missing, use a dash
                                const intervalFormatted = found
                                    ? flashcardHelper.formatInterval({
                                          nextInterval: found.interval,
                                          baseIntervalWithDeviation: found.baseIntervalWithDeviation,
                                      })
                                    : '—';

                                return (
                                    <TooltipProvider key={index}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="col-span-3 h-full flex flex-col gap-0 justify-center items-center rounded-lg p-2
                   bg-white dark:bg-gray-700 cursor-pointer"
                                                    onClick={() => handleRatingClick(option.rating)}
                                                    aria-disabled={!found?.interval}
                                                >
                                                    {option.icon}
                                                    <Label className="text-lg">{option.label}</Label>
                                                    <Label className="text-sm text-foreground">
                                                        {intervalFormatted}
                                                    </Label>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>Key shortcut: {option.rating}</TooltipContent>
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
                                    onClick={onFlip}
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
