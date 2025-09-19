'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { putRequest } from '@/api/api';
import LoadingPage from '@/app/loading';
import { FlashcardLearning } from '../components/FlashcardLearning';
import { useParams, useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useUserTrackingContext } from '@/contexts/tracking/UserTrackingContext';
import {
    IAnkiCardReviewed,
    IAnkiRating,
    IAnkiStatus,
    IDueAnkiCard,
    IFlashcard,
    IQualityResponseNextReviewInterval,
} from '../../types/flashcard.type';
import { IItemStatus, IQualityResponse } from '@/types/itemSpacedRepetitionTracking.type';
import flashcardService, {
    IFlashcardReviewByAnkiPayload,
    IFlashcardReviewPayload,
} from '@/services/flashcard/flashcard.service';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

import { useGenerateFromExisting } from '@/app/[locale]/generate/hooks/useGenerateFromExisting';
import { handleConvertToQuestionsEdited } from '@/app/[locale]/question/utils/handleConvertToQuestionsEdited';
import { CONTENT_TYPE_GENERATE, IQuestionsFromSSERaw } from '@/app/[locale]/generate/types';
import { writeLocalQuiz } from '@/app/[locale]/quiz/utils/localQuiz.storage';
import { buildPayloadFromLearnedFlashcards } from '@/app/[locale]/question/utils/buildGenPayload';
import { isAfter } from 'date-fns';

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

    // initial total when fetched
    const [initialTotal, setInitialTotal] = useState<number>(0);
    // List of lessons learned (reviewed)
    const [studied, setStudied] = useState<IDueAnkiCard[]>([]);
    // "chunk 20%" completed
    const [chunksDone, setChunksDone] = useState<number>(0);
    // preparing quiz for chunk number (to navigate when SSE is done)
    const [pendingChunk, setPendingChunk] = useState<number | null>(null);

    const { regenerate, sseData, sseStatus, loading } = useGenerateFromExisting();

    const isGenerating = pendingChunk !== null && (loading || sseStatus === 'open');

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

    useEffect(() => {
        if (flashcards && flashcards.length > 0) {
            setInitialTotal(flashcards.length);
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
        }
    }, [flashcards]);

    const chunkSize = Math.max(1, Math.ceil(initialTotal * 0.2)); // luôn >=1

    // Wait for SSE "completed" -> parse -> save local -> redirect to local quiz page
    useEffect(() => {
        const raw = (sseData as any)?.data?.data as IQuestionsFromSSERaw | undefined;
        const payloadStatus = (sseData as any)?.data?.status ?? (sseData as any)?.status;

        // only process while waiting for a specific chunk
        if (pendingChunk === null) return;

        const isCompleted = sseStatus === 'completed' || payloadStatus === 'completed';
        if (!isCompleted) return;
        if (!Array.isArray(raw) || raw.length === 0) return;

        const parsed = handleConvertToQuestionsEdited({
            type: 'generative',
            questionsProp: raw,
        });

        const toStore = parsed.map((q) => ({
            questionText: q.questionText,
            choices: q.choices,
            correctIndex: q.correctIndex,
        }));

        writeLocalQuiz(topicId, toStore);

        router.push(`/quiz/local?topicId=${topicId}&chunk=${pendingChunk}`);
    }, [sseStatus, sseData, pendingChunk, topicId, router]);

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

                const newStudied = [...studied, currentFlashcard];
                setStudied(newStudied);

                // Update learning tracking metrics using context methods
                updateItemsStudied(itemsStudiedCount + 1);
                // Identify correct answers by Selecting rating >= HARD
                if (data?.rating && data.rating >= IAnkiRating.HARD) {
                    updateCorrectAnswers(correctAnswersCount + 1);
                }

                // If finish learning the new 20% chunk -> ask gen quiz
                const studiedCountAfter = newStudied.length;
                const nextChunk = chunksDone + 1;
                const nextThreshold = nextChunk * chunkSize;
                const justReachedNewChunk = studiedCountAfter >= nextThreshold;

                if (justReachedNewChunk && !loading && pendingChunk === null) {
                    const ok = window.confirm('Bạn đã học xong 20% bài. Bạn có muốn làm quiz nhanh không?');
                    if (ok) {
                        const start = chunksDone * chunkSize;
                        const end = Math.min(start + chunkSize, studiedCountAfter);
                        const chunkCards = newStudied.slice(start, end);

                        const payload = buildPayloadFromLearnedFlashcards(topicId, chunkCards);
                        setPendingChunk(nextChunk);
                        await regenerate(payload, 'quiz'); // SSE completed sẽ redirect
                    }
                    setChunksDone(nextChunk);
                }

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
        [flashcards, currentFlashcard],
    );

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
        <>
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

            {isGenerating && (
                <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <div className="rounded-xl bg-white px-6 py-5 shadow-lg">Generating quiz…</div>
                </div>
            )}
        </>
    );
}
