'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { IFlashcard, IQualityResponseNextReviewInterval } from '../types/flashcard.type';
import { IQualityResponse } from '@/types/itemSpacedRepetitionTracking.type';
import LoadingPage from '@/app/loading';
import { FlashcardLearning } from './components/FlashcardLearning';
import NoFlashcardsMessage from './components/NoFlashcardsMessage';
import { useUserTrackingContext } from '@/contexts/tracking/UserTrackingContext';
import { IAnkiRating, IAnkiStatus, IDueAnkiCard } from '../types/flashcard.type';
import flashcardService, { IFlashcardReviewByAnkiPayload } from '@/services/flashcard/flashcard.service';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGamification } from '@/hooks/useGamification';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { PointSystem } from '@/components/gamification/PointSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Star, Trophy, Target, BookOpen } from 'lucide-react';
import { useFlashcardStreakTracking } from '@/hooks/useStreakProgress';

export type IFlashcardWithReview = Pick<IFlashcard, 'flashcardId' | 'front' | 'back' | 'topicName'> & {
    qualityResponsesNextReviewInterval: IQualityResponseNextReviewInterval[];
};

export type IFlashcardStatusCounts = Record<Exclude<IAnkiStatus, IAnkiStatus.RELEARNING>, number>;

export default function Page() {
    const router = useRouter();
    const tFlashcardLearning = useTranslations('flashcard.learning');
    const { trackFlashcardSession } = useFlashcardStreakTracking();
    
    // Get current user ID (you might need to get this from auth context)
    const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);
    
    // Get user ID from localStorage or auth context
    useEffect(() => {
        // Try to get user ID from localStorage first
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setCurrentUserId(parseInt(storedUserId));
        } else {
            // If no stored user ID, use a default for demo purposes
            // In production, you should get this from your auth context
            setCurrentUserId(1); // Demo user ID
        }
    }, []);
    
    // Gamification hooks
    const { 
        updateStreak, 
        awardPoints, 
        currentStreak, 
        totalPoints, 
        level,
        streakData,
        pointsData,
        loading: gamificationLoading,
        refreshData
    } = useGamification(currentUserId);
    
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
        loading: flashcardLoading,
        error: flashcardError,
    } = useFetch<IDueAnkiCard[]>('/flashcards/learning');

    const [flashcardStatusCounts, setFlashcardsStatusCounts] = useState<IFlashcardStatusCounts>({
        [IAnkiStatus.NEW]: 0,
        [IAnkiStatus.LEARNING]: 0,
        [IAnkiStatus.REVIEW]: 0,
    });

    const [sessionStats, setSessionStats] = useState({
        cardsReviewed: 0,
        correctAnswers: 0,
        pointsEarned: 0,
        streakUpdated: false,
    });

    // Track if user has actually studied anything in this session
    const [hasStudied, setHasStudied] = useState(false);
    const [initialFlashcardCount, setInitialFlashcardCount] = useState<number | null>(null);

    const currentFlashcard = flashcards ? flashcards[0] : null;

    const flashcardContainerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const isFrontRef = useRef<boolean>(true);

    const [shouldShowTrackingOptions, setShouldShowTrackingOptions] = useState<boolean>(false);

    // Update status counts when flashcards change
    useEffect(() => {
        if (flashcards) {
            // Set initial count if not set yet
            if (initialFlashcardCount === null) {
                setInitialFlashcardCount(flashcards.length);
            }
            
            if (flashcards.length > 0) {
                const counter: IFlashcardStatusCounts = {
                    [IAnkiStatus.NEW]: 0,
                    [IAnkiStatus.LEARNING]: 0,
                    [IAnkiStatus.REVIEW]: 0,
                };
                for (const card of flashcards) {
                    const status = card.status === IAnkiStatus.RELEARNING ? IAnkiStatus.LEARNING : card.status;
                    counter[status]++;
                }
                setFlashcardsStatusCounts(counter);
            }
        }
    }, [flashcards, initialFlashcardCount]);

    // Initialize session when component mounts
    useEffect(() => {
        const initializeSession = async () => {
            resetLearningSession();
            if (currentFlashcard) {
                startStudySession('general', currentFlashcard.topicName || 'Flashcards');
                
                // Update streak on session start (only if we have a user ID)
                if (currentUserId) {
                    try {
                        console.log('Updating streak for user:', currentUserId);
                        await updateStreak();
                        setSessionStats(prev => ({ ...prev, streakUpdated: true }));
                        // Refresh gamification data after updating streak
                        await refreshData();
                    } catch (error) {
                        console.error('Error updating streak:', error);
                    }
                }
            }
        };

        // Only initialize if we have a user ID
        if (currentUserId) {
            initializeSession();
        }

        return () => {
            const accuracy = itemsStudiedCount > 0 ? (correctAnswersCount / itemsStudiedCount) * 100 : 0;
            endStudySession(itemsStudiedCount, accuracy);
            saveCurrentLearningSession('general', flashcards?.length || 0, false);
        };
    }, [currentUserId, currentFlashcard]);

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

        if (cardRef.current) {
            cardRef.current.style.transform = isFrontRef.current ? 'rotateX(180deg)' : 'rotateX(0deg)';
            isFrontRef.current = !isFrontRef.current;
        }
    }

    const calculatePointsForRating = (rating: IAnkiRating): number => {
        const basePoints = 2; // Base points for reviewing flashcards
        const multiplier = rating >= IAnkiRating.GOOD ? 1.5 : 1; // Bonus for good ratings
        return Math.round(basePoints * multiplier);
    };

    const [currentRating, setCurrentRating] = useState<IAnkiRating | null>(null);

    const { loading: trackFlashcardLoading, execute: trackFlashcard } = usePost<
        IFlashcardReviewByAnkiPayload,
        any
    >(
        ({ flashcardId, rating }) => {
            setCurrentRating(rating); // Store rating for use in success callback
            return flashcardService.reviewFlashcardByAnki({ 
                topicId: 'general', 
                flashcardId, 
                rating 
            });
        },
        'PATCH',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess: async (data) => {
                if (!flashcards || !currentFlashcard) return;
                
                // Update status counts
                setFlashcardsStatusCounts((prev) => {
                    const updated = { ...prev };
                    const currentFlashcardStatus =
                        currentFlashcard.status === IAnkiStatus.RELEARNING
                            ? IAnkiStatus.LEARNING
                            : currentFlashcard.status;
                    updated[currentFlashcardStatus]--;
                    if (data && data.status) {
                        const newStatus = data.status === IAnkiStatus.RELEARNING ? IAnkiStatus.LEARNING : data.status;
                        if (newStatus in updated) {
                            updated[newStatus as keyof typeof updated]++;
                        }
                    }
                    return updated;
                });

                // Remove current card and update the list
                const flashcardsUpdated = [...flashcards];
                flashcardsUpdated.shift();

                if (data) {
                    // Insert card back in appropriate position based on next review time
                    let inserted = false;
                    for (let i = 0; i < flashcardsUpdated.length; ++i) {
                        const card = flashcardsUpdated[i];
                        if (new Date(data.nextReview) > new Date(card.nextReview)) continue;
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

                // Mark that user has studied something
                setHasStudied(true);
                
                // Update learning tracking metrics
                updateItemsStudied(itemsStudiedCount + 1);
                
                // Award points based on rating
                const rating = currentRating || IAnkiRating.GOOD; // Use stored rating or default to GOOD
                const pointsEarned = calculatePointsForRating(rating);
                try {
                    await awardPoints({
                        action: 'flashcard_reviewed',
                        points: pointsEarned,
                        metadata: { 
                            flashcardId: currentFlashcard.flashcardId,
                            rating,
                            topicName: currentFlashcard.topicName
                        }
                    });
                    // Refresh gamification data after awarding points
                    await refreshData();
                } catch (error) {
                    console.error('Error awarding points:', error);
                }

                // Update correct answers based on rating
                if (rating >= IAnkiRating.GOOD) {
                    updateCorrectAnswers(correctAnswersCount + 1);
                }

                // Update session stats
                setSessionStats(prev => ({
                    ...prev,
                    cardsReviewed: prev.cardsReviewed + 1,
                    correctAnswers: rating >= IAnkiRating.GOOD ? prev.correctAnswers + 1 : prev.correctAnswers,
                    pointsEarned: prev.pointsEarned + pointsEarned,
                }));

                // If this was the last card, save progress to database
                if (flashcardsUpdated.length === 0) {
                    await saveCurrentLearningSession('general', flashcards.length, true);
                }
            },
        },
    );

    async function handleOnClickTrackingOption(rating: IAnkiRating) {
        if (!flashcards || !currentFlashcard || !currentUserId) return;
        
        // Track flashcard review
        await trackFlashcard({
            topicId: 'general',
            flashcardId: currentFlashcard.flashcardId,
            rating,
        });

        // Track streak progress
        try {
            const accuracy = rating >= IAnkiRating.GOOD ? 100 : rating >= IAnkiRating.HARD ? 75 : 50;
            await trackFlashcardSession(
                currentUserId.toString(),
                'general',
                1, // 1 flashcard studied
                accuracy,
                30 // 30 seconds estimated time per card
            );
        } catch (error) {
            console.error('Error tracking streak progress:', error);
            // Don't show error to user, just log it
        }
    }

    if (flashcardLoading === true || flashcards === null || flashcards === undefined) {
        return <LoadingPage />;
    }

    if (flashcards.length === 0 || !currentFlashcard) {
        return (
            <NoFlashcardsMessage
                hasStudied={hasStudied}
                initialFlashcardCount={initialFlashcardCount}
                sessionStats={sessionStats}
                onGoBack={() => router.back()}
            />
        );
    }

    if (flashcardError) {
        return <div>Something went wrong with Flashcards</div>;
    }

    return (
        <div className="flex bg-gray-background w-full h-full">
            {/* Left Sidebar - Gamification Stats */}
            <div className="w-80 p-4 space-y-4 bg-white border-r border-gray-200">
                <div className="space-y-4">
                    <StreakDisplay userId={currentUserId} compact={true} />
                    <PointSystem userId={currentUserId} compact={true} />
                    
                    {/* Session Progress */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Session Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Cards Reviewed</span>
                                <span className="font-semibold">{sessionStats.cardsReviewed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Correct</span>
                                <span className="font-semibold text-green-600">{sessionStats.correctAnswers}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Points Earned</span>
                                <span className="font-semibold text-yellow-600">+{sessionStats.pointsEarned}</span>
                            </div>
                            {sessionStats.cardsReviewed > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>Accuracy</span>
                                    <span className="font-semibold">
                                        {Math.round((sessionStats.correctAnswers / sessionStats.cardsReviewed) * 100)}%
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Quick Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Remaining</span>
                                <span className="font-semibold">{flashcards.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>New Cards</span>
                                <Badge variant="secondary">{flashcardStatusCounts[IAnkiStatus.NEW]}</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Learning</span>
                                <Badge variant="secondary">{flashcardStatusCounts[IAnkiStatus.LEARNING]}</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Review</span>
                                <Badge variant="secondary">{flashcardStatusCounts[IAnkiStatus.REVIEW]}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Content - Flashcard Learning */}
            <div className="flex-1">
                <FlashcardLearning
                    topicName={currentFlashcard.topicName || 'General'}
                    total={flashcards.length}
                    flashcardContainerRef={flashcardContainerRef}
                    cardRef={cardRef}
                    isFrontRef={isFrontRef}
                    flashcard={currentFlashcard}
                    handleManualFlip={handleManualFlip}
                    shouldShowTrackingOptions={shouldShowTrackingOptions}
                    handleLearningOptionClick={handleOnClickTrackingOption}
                    flashcardStatusCounts={flashcardStatusCounts}
                />
            </div>
        </div>
    );
}
