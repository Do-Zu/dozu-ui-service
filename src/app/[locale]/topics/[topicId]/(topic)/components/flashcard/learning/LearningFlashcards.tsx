import { useTranslations } from 'next-intl';
import { IAnkiCardReviewed, IAnkiCardStatusCounts, IDueAnkiCard } from '@/app/[locale]/flashcards/types/flashcard.type';
import { Button } from '@/components/ui/button';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IAnkiRating, IAnkiStatus } from '@/types/anki';
import { useRouter } from 'next/navigation';
import { QuizCard, useQuizMilestones } from '@/app/[locale]/flashcards/learning/hooks/useQuizMilestones';
import { useUserTrackingContext } from '@/contexts/tracking/UserTrackingContext';
import useFetch from '@/hooks/useFetch';
import flashcardService, { IFlashcardReviewByAnkiPayload } from '@/services/flashcard/flashcard.service';
import { useGenerateFromExisting } from '@/app/[locale]/generate/hooks/useGenerateFromExisting';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { isAfter } from 'date-fns';
import { ROUTES } from '@/utils/constants/routes';
import { METHOD_LEARNING } from '@/utils/constants/method';
import LoadingPage from '@/app/loading';
import BacklogCTA from '@/app/[locale]/flashcards/learning/components/BacklogCTA';
import QuickQuizPrompt from '@/app/[locale]/flashcards/learning/components/QuickQuizPrompt';
import LearningCard from './LearningCard';
import { useRequireTopic } from '../../../context/useRequireTopic';
import { useRequireLearningFlashcards } from '../../../context/useRequireFlashcardContent';
import LearningFlashcardsEmptyState from './LearningFlashcardsEmptyState';

export default function LearningFlashcards() {
    const { topic } = useRequireTopic();
    const { topicId, flashcardCounts } = topic;
    const { learningFlashcards: flashcards, onReviewCard } = useRequireLearningFlashcards();
    const router = useRouter();
    const tCommon = useTranslations('common');
    const tFlashcardLearning = useTranslations('flashcard.learning');

    // studied list
    const [studied, setStudied] = useState<QuizCard[]>([]);

    // helper to standardize quiz cards
    const toQuizCard = (c: any): QuizCard => ({
        flashcardId: c.flashcardId,
        front: c.front,
        back: c.back,
        imageUrl: c.imageUrl ?? null,
        topicName: c.topicName ?? null,
    });

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

    // gen & SSE
    const { regenerate, sseData, sseStatus, loading } = useGenerateFromExisting();

    // milestones 50% + 100%
    const q = useQuizMilestones({
        topicId: topicId.toString(),
        regenerate,
        sseData,
        sseStatus,
        loading,
        chunkRatio: 0.5,
    });

    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        q.ensureBaseline(flashcards.length, flashcards.map(toQuizCard));
    }, [flashcards, q]);

    // reset studied when session changes
    useEffect(() => {
        setStudied([]);
    }, [q.sessionEpoch]);

    const currentFlashcard = flashcards[0];

    const [shouldShowTrackingOptions, setShouldShowTrackingOptions] = useState<boolean>(false);

    const { loading: reviewFlashcardLoading, execute: reviewFlashcardAsync } = usePost<
        IFlashcardReviewByAnkiPayload,
        IAnkiCardReviewed | null
    >(
        ({ topicId, flashcardId, rating }) => flashcardService.reviewFlashcardByAnki({ topicId, flashcardId, rating }),
        'PATCH',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess: async (data) => {
                if (!flashcards || !currentFlashcard) return;
                // Ky Anh section - handle updating flashcards & flashcardsStatuCounts & relevant states related to 'Learning'
                setFlipInstantly(false);
                setShouldShowTrackingOptions(false);
                const updatedLearningFlashcards = onReviewCard({
                    currentCard: currentFlashcard,
                    reviewedCard: data,
                });
                if (!updatedLearningFlashcards) return;
                // ending Ky Anh section - handle updating flashcards & flashcardsStatuCounts

                // Update learning tracking metrics using context methods
                updateItemsStudied(itemsStudiedCount + 1);
                // Identify correct answers by Selecting rating >= HARD
                if (data?.rating && data.rating >= IAnkiRating.HARD) {
                    updateCorrectAnswers(correctAnswersCount + 1);
                }

                // Sync studied + milestone according to updated list from BE
                setStudied((prev) => {
                    const last = prev[prev.length - 1];
                    if (last && String(last.flashcardId) === String(currentFlashcard.flashcardId)) {
                        q.onStudiedProgress(prev, updatedLearningFlashcards.length);
                        return prev;
                    }
                    const newStudied = [...prev, toQuizCard(currentFlashcard)];
                    q.onStudiedProgress(newStudied, updatedLearningFlashcards.length);
                    return newStudied;
                });

                // If this was the last card, save progress to database using context method
                if (updatedLearningFlashcards.length === 0) {
                    await saveCurrentLearningSession(
                        topicId.toString(),
                        flashcards.length,
                        true, // completed
                    );
                }
            },
        },
    );

    // Initialize session when component mounts
    useEffect(() => {
        resetLearningSession();
        if (topicId && currentFlashcard) {
            startStudySession(topicId.toString(), currentFlashcard.topicName);
        }

        // End session when component unmounts ONLY
        return () => {
            const accuracy = itemsStudiedCount > 0 ? (correctAnswersCount / itemsStudiedCount) * 100 : 0;
            endStudySession(itemsStudiedCount, accuracy);

            // Save final session data to database using context method
            // Don't mark as completed on unmount since user might be just leaving the page
            saveCurrentLearningSession(
                topicId.toString(),
                flashcards?.length || 0,
                false, // not completed on unmount
            ).catch((error: any) => {
                console.error('Failed to save learning progress on unmount:', error);
            });
        };
    }, []); // Empty dependency array - only run on mount/unmount

    function flipWithAnimation() {
        if (shouldShowTrackingOptions) return;
        setIsAnimating(true);
        setIsFlipped((prev) => !prev);
        setShouldShowTrackingOptions(true);
    }

    function setFlipWithAnimation(isFlipped: boolean) {
        setIsAnimating(true);
        setIsFlipped(isFlipped);
    }

    function setFlipInstantly(isFlipped: boolean) {
        setIsAnimating(false);
        setIsFlipped(isFlipped);
    }

    const handleReviewFlashcardClick = useCallback(
        async (rating: IAnkiRating) => {
            if (!shouldShowTrackingOptions) return;
            const { flashcardId } = currentFlashcard;
            await reviewFlashcardAsync({
                topicId,
                flashcardId,
                rating,
            });
        },
        [flashcards, currentFlashcard, studied, q, topicId, reviewFlashcardAsync, shouldShowTrackingOptions],
    );

    function handleBackClick() {
        router.back();
    }

    function handleRedirectFeynmanPage() {
        router.push(ROUTES.FEYNMAN_REVIEW(topicId, METHOD_LEARNING.FLASHCARD));
    }

    const onConfirmOnlySecond = async () => {
        const { onlySecond } = q.getFullCards();
        await q.startFullOnlySecond(onlySecond);
    };

    const onConfirmCatchUpAll = async () => {
        const { catchUpAll } = q.getFullCards();
        await q.startFullCatchUpAll(catchUpAll);
    };

    const onSkipFull = () => {
        const { onlySecond } = q.getFullCards();
        q.skipFullQuiz(onlySecond);
    };

    if (flashcards.length === 0) {
        return <LearningFlashcardsEmptyState topicId={topicId} />;
    }

    return (
        <>
            {/* Backlog banner */}
            {q.backlogCount > 0 && <BacklogCTA count={q.backlogCount} onClick={q.startBacklogQuiz} />}

            {/* main content */}
            {flashcards.length === 0 || !currentFlashcard ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                            <svg
                                className="w-8 h-8 text-gray-800"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
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
                                className="px-6 py-2 mx-10 rounded-lg transition-colors border border-gray-300"
                            >
                                {tCommon('actions.back')}
                            </Button>

                            <Button
                                onClick={handleRedirectFeynmanPage}
                                className="px-6 py-2  rounded-lg transition-colors border border-gray-300"
                            >
                                {tFlashcardLearning('reviewKnowledge')}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <LearningCard
                    flashcard={currentFlashcard}
                    shouldShowTrackingOptions={shouldShowTrackingOptions}
                    isFlipped={isFlipped}
                    isAnimating={isAnimating}
                    onFlip={flipWithAnimation}
                    handleRatingClick={handleReviewFlashcardClick}
                    flashcardStatusCounts={flashcardCounts || { new: 0, learning: 0, review: 0 }}
                />
            )}

            {q.isGenerating && (
                <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <div className="rounded-xl bg-white px-6 py-5 shadow-lg">Generating quiz…</div>
                </div>
            )}

            <QuickQuizPrompt
                open={q.promptOpen}
                variant={q.promptVariant}
                percentLabel={q.percentLabel}
                showCatchUp={q.showCatchUp}
                onConfirmHalf={q.confirmHalfQuiz}
                onConfirmOnlySecond={onConfirmOnlySecond}
                onConfirmCatchUpAll={onConfirmCatchUpAll}
                onSkip={q.promptVariant === 'half' ? q.skipHalfQuiz : onSkipFull}
            />
        </>
    );
}
