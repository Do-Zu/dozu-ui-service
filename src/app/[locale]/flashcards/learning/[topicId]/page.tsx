'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import LoadingPage from '@/app/loading';
import { FlashcardLearning } from '../components/FlashcardLearning';
import { useParams, useRouter } from 'next/navigation';
import { useUserTrackingContext } from '@/contexts/tracking/UserTrackingContext';
import {
    IAnkiCardReviewed,
    IAnkiRating,
    IAnkiStatus,
    IDueAnkiCard,
    IFlashcard,
    IQualityResponseNextReviewInterval,
} from '../../types/flashcard.type';
import flashcardService, { IFlashcardReviewByAnkiPayload } from '@/services/flashcard/flashcard.service';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useGenerateFromExisting } from '@/app/[locale]/generate/hooks/useGenerateFromExisting';
import { isAfter } from 'date-fns';
import { ROUTES } from '@/utils/constants/routes';
import { METHOD_LEARNING } from '@/utils/constants/method';
import QuickQuizPrompt from '@/app/[locale]/flashcards/learning/components/QuickQuizPrompt';
import { useQuizMilestones, type QuizCard } from '@/app/[locale]/flashcards/learning/hooks/useQuizMilestones';
import BacklogCTA from '@/app/[locale]/flashcards/learning/components/BacklogCTA';

export type IFlashcardWithReviewPrediction = Pick<
    IFlashcard,
    'flashcardId' | 'front' | 'back' | 'imageUrl' | 'topicName'
> & {
    qualityResponsesNextReviewInterval: IQualityResponseNextReviewInterval[];
};

export type IFlashcardStatusCounts = Record<Exclude<IAnkiStatus, IAnkiStatus.RELEARNING>, number>;

export default function Page() {
    const params = useParams();
    if (!params?.topicId) return <div>No topic id is provided</div>;

    const router = useRouter();
    const tCommon = useTranslations('common');
    const tFlashcardLearning = useTranslations('flashcard.learning');
    const { topicId } = params as { topicId: string };

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

    const {
        data: flashcards,
        setData: setFlashcardsData,
        loading: flashcardsLoading,
        error: flashcardsError,
    } = useFetch<IDueAnkiCard[]>(() => flashcardService.getDueAnkiCardsForTopic(topicId));

    const firstToFetchFlashcards = useRef(true);

    const [flashcardStatusCounts, setFlashcardsStatusCounts] = useState<IFlashcardStatusCounts>({
        [IAnkiStatus.NEW]: 0,
        [IAnkiStatus.LEARNING]: 0,
        [IAnkiStatus.REVIEW]: 0,
    });

    // gen & SSE
    const { regenerate, sseData, sseStatus, loading } = useGenerateFromExisting();

    // milestones 50% + 100%
    const q = useQuizMilestones({
        topicId,
        regenerate,
        sseData,
        sseStatus,
        loading,
        chunkRatio: 0.5,
    });

    useEffect(() => {
        if (flashcards && flashcards.length > 0) {
            if (firstToFetchFlashcards.current) {
                const counter: IFlashcardStatusCounts = {
                    [IAnkiStatus.NEW]: 0,
                    [IAnkiStatus.LEARNING]: 0,
                    [IAnkiStatus.REVIEW]: 0,
                };
                for (const card of flashcards) {
                    // number of 'learning' cards equals to both 'learning' and 'relearning' cards
                    const status = card.status === IAnkiStatus.RELEARNING ? IAnkiStatus.LEARNING : card.status;
                    counter[status]++;
                }
                setFlashcardsStatusCounts(counter);
                firstToFetchFlashcards.current = false;
            }
            q.ensureBaseline(flashcards.length, flashcards.map(toQuizCard));
        }
    }, [flashcards, q]);

    // reset studied when session changes
    useEffect(() => {
        setStudied([]);
    }, [q.sessionEpoch]);

    const currentFlashcard = flashcards ? flashcards[0] : null;

    const flashcardContainerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const isFrontRef = useRef<boolean>(true);

    const [shouldShowTrackingOptions, setShouldShowTrackingOptions] = useState<boolean>(false);

    const { loading: trackFlashcardLoading, execute: trackFlashcard } = usePost<
        IFlashcardReviewByAnkiPayload,
        IAnkiCardReviewed | null
    >(
        ({ topicId, flashcardId, rating }) => flashcardService.reviewFlashcardByAnki({ topicId, flashcardId, rating }),
        'PATCH',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess: async (data) => {
                if (!flashcards || !currentFlashcard) return;
                const flashcardsUpdated = [...flashcards];
                setFlashcardsStatusCounts((prev) => {
                    const updated = { ...prev };
                    const currentFlashcardStatus =
                        currentFlashcard.status === IAnkiStatus.RELEARNING
                            ? IAnkiStatus.LEARNING
                            : currentFlashcard.status;
                    updated[currentFlashcardStatus]--;
                    if (data) {
                        // UPDATE flashcard count for each status
                        const newStatus = data.status === IAnkiStatus.RELEARNING ? IAnkiStatus.LEARNING : data.status;
                        updated[newStatus]++;
                    }
                    return updated;
                });

                flashcardsUpdated.shift();

                if (data) {
                    // INSERT this card to a suitable position (to maintain ORDER by nextReview)
                    let inserted = false;
                    for (let i = 0; i < flashcardsUpdated.length; ++i) {
                        const card = flashcardsUpdated[i];
                        if (isAfter(data.nextReview, card.nextReview)) continue;
                        flashcardsUpdated.splice(i, 0, {
                            ...currentFlashcard,
                            nextReview: data.nextReview,
                            status: data.status,
                            nextReviewSchedule: data.nextReviewSchedule,
                        });
                        inserted = true;
                        break;
                    }

                    if (!inserted) {
                        flashcardsUpdated.push({
                            ...currentFlashcard,
                            nextReview: data.nextReview,
                            status: data.status,
                            nextReviewSchedule: data.nextReviewSchedule,
                        });
                    }
                }
                setFlashcardsData(flashcardsUpdated);

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
                        q.onStudiedProgress(prev, flashcardsUpdated.length);
                        return prev;
                    }
                    const newStudied = [...prev, toQuizCard(currentFlashcard)];
                    q.onStudiedProgress(newStudied, flashcardsUpdated.length);
                    return newStudied;
                });

                // If this was the last card, save progress to database using context method
                if (flashcardsUpdated.length === 0) {
                    await saveCurrentLearningSession(
                        topicId as string,
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

    const handleManualFlip = useCallback(() => {
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
    }, []);

    const handleReviewFlashcardClick = useCallback(
        async (rating: IAnkiRating) => {
            if (!flashcards || !currentFlashcard) return;
            const { flashcardId } = currentFlashcard;
            await trackFlashcard({
                topicId,
                flashcardId,
                rating,
            });
        },
        [flashcards, currentFlashcard, studied, q, topicId, trackFlashcard, setFlashcardsData],
    );

    function handleBackClick() {
        router.back();
    }

    function handleRedirectFeynmanPage() {
        router.push(ROUTES.FEYNMAN_REVIEW(topicId, METHOD_LEARNING.FLASHCARD));
    }

    if (flashcardsError) {
        return <div>Error: {flashcardsError}</div>;
    }

    if (flashcardsLoading === true || flashcards === null || flashcards === undefined) {
        return <LoadingPage />;
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
                <FlashcardLearning
                    topicName={currentFlashcard.topicName ? currentFlashcard.topicName : ''}
                    total={flashcards.length}
                    flashcardContainerRef={flashcardContainerRef}
                    cardRef={cardRef}
                    isFrontRef={isFrontRef}
                    flashcard={currentFlashcard}
                    handleManualFlip={handleManualFlip}
                    shouldShowTrackingOptions={shouldShowTrackingOptions}
                    handleLearningOptionClick={handleReviewFlashcardClick}
                    flashcardStatusCounts={flashcardStatusCounts}
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
