'use client';

import { useEffect, useRef, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { putRequest } from '@/api/api';
import LoadingPage from '@/app/loading';
import { FlashcardLearning } from '../components/FlashcardLearning';
import { useParams, useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useUserTrackingContext } from '@/contexts/tracking/UserTrackingContext';
import { IFlashcard, IQualityResponseNextReviewInterval } from '../../types/flashcard.type';
import { IQualityResponse } from '@/types/itemSpacedRepetitionTracking.type';
import flashcardService, { IFlashcardReviewPayload } from '@/services/flashcard/flashcard.service';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export type IFlashcardWithReviewPrediction = Pick<
    IFlashcard,
    'flashcardId' | 'front' | 'back' | 'imageUrl' | 'topicName'
> & {
    qualityResponsesNextReviewInterval: IQualityResponseNextReviewInterval[];
};

export default function Page() {
    const params = useParams();
    if (!params?.topicId) return <div>No topic id is provided</div>;

    const router = useRouter();
    const tCommon = useTranslations('common');
    const tFlashcardLearning = useTranslations('flashcard.learning');
    const { topicId } = params as { topicId: string };

    // Learning tracking integration
    const {
        startStudySession,
        endStudySession,
        getStudyMetrics,
        itemsStudiedCount,
        correctAnswersCount,
        sessionStartTime,
        updateItemsStudied,
        updateCorrectAnswers,
        resetLearningSession,
        saveCurrentLearningSession,
    } = useUserTrackingContext();

    const {
        data: flashcards,
        setData: setFlashcardsData,
        loading: flashcardsLoading,
        error: flashcardsError,
    } = useFetch<IFlashcardWithReviewPrediction[]>(() => flashcardService.getDueFlashcardsForTopic(topicId));

    const currentFlashcard = flashcards ? flashcards[0] : null;

    const flashcardContainerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const isFrontRef = useRef<boolean>(true);

    const [shouldShowTrackingOptions, setShouldShowTrackingOptions] = useState<boolean>(false);

    const { loading: apiLoading, execute } = usePost<IFlashcardReviewPayload, {}>(
        ({ topicId, flashcardId, qualityResponse }) =>
            flashcardService.reviewFlashcardWithQuality({ topicId, flashcardId, qualityResponse }),
        'PATCH',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess: (data) => {
                toastHelper.showSuccessMessage('We have saved Your Progress!');
            },
        },
    );

    // Initialize session when component mounts
    useEffect(() => {
        resetLearningSession();
        if (topicId && currentFlashcard) {
            startStudySession(topicId as string, currentFlashcard.topicName);
        }

        // End session when component unmounts ONLY
        return () => {
            const accuracy = itemsStudiedCount > 0 ? (correctAnswersCount / itemsStudiedCount) * 100 : 0;
            endStudySession(itemsStudiedCount, accuracy);

            // Save final session data to database using context method
            // Don't mark as completed on unmount since user might be just leaving the page
            saveCurrentLearningSession(
                topicId as string,
                flashcards?.length || 0,
                false, // not completed on unmount
            ).catch((error: any) => {
                console.error('Failed to save learning progress on unmount:', error);
            });
        };
    }, []); // Empty dependency array - only run on mount/unmount

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

    async function handleReviewFlashcardClick(qualityResponse: IQualityResponse) {
        if (!flashcards || !currentFlashcard) return;
        try {
            const { flashcardId } = currentFlashcard;
            await execute({
                topicId,
                flashcardId,
                qualityResponse,
            });
            const flashcardsFiltered = flashcards.slice(1);
            setFlashcardsData(flashcardsFiltered);

            // Update learning tracking metrics using context methods
            updateItemsStudied(itemsStudiedCount + 1);
            if (qualityResponse >= 3) {
                updateCorrectAnswers(correctAnswersCount + 1);
            }

            // If this was the last card, save progress to database using context method
            if (flashcardsFiltered.length === 0) {
                await saveCurrentLearningSession(
                    topicId as string,
                    flashcards.length,
                    true, // completed
                );
            }
        } catch (err) {
            toast({
                title: 'Review failed, please try again',
                variant: 'destructive',
            });
        }
    }

    function handleBackClick() {
        router.back();
    }

    if (flashcardsError) {
        return <div>Error: {flashcardsError}</div>;
    }

    if (flashcardsLoading === true || flashcards === null || flashcards === undefined) {
        return <LoadingPage />;
    }

    if (flashcards.length === 0 || !currentFlashcard) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                        <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-black">{tFlashcardLearning('greatJob')}</h2>
                    <p className="text-gray-700 max-w-md">{tFlashcardLearning('flashcardsCompleted')}</p>
                    <div className="pt-4">
                        <Button
                            onClick={handleBackClick}
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors border border-gray-300"
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <FlashcardLearning
            topicName={currentFlashcard.topicName ? currentFlashcard.topicName : ''}
            total={flashcards.length}
            flashcardContainerRef={flashcardContainerRef}
            cardRef={cardRef}
            isFrontRef={isFrontRef}
            flashcard={currentFlashcard}
            handleManualFlip={handleManualFlip}
            shouldShowTrackingOptions={shouldShowTrackingOptions}
            handleOnClickTrackingOption={handleReviewFlashcardClick}
        />
    );
}
