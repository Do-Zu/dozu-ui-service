'use client';

import { useEffect, useRef, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { putRequest } from '@/api/api';
import { IFlashcardFull, IQualityResponse, IQualityResponseNextReviewInterval } from '../../types/flashcard.type';
import LoadingPage from '@/app/loading';
import { FlashcardLearning } from '../components/FlashcardLearning';
import { useParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useUserTrackingContext } from '@/contexts/tracking/UserTrackingContext';

export type IFlashcard = Pick<IFlashcardFull, 'flashcardId' | 'front' | 'back' | 'topicName'> & {
    qualityResponsesNextReviewInterval: IQualityResponseNextReviewInterval[];
};

export default function Page() {
    const params = useParams();
    if (!params?.topicId) return <div>No topic id is provided</div>;

    const { topicId } = params;
    
    // Learning tracking integration
    const { startStudySession, endStudySession, getStudyMetrics, handleSaveTrackingProgressLearning } = useUserTrackingContext();

    const {
        data: flashcards,
        setData: setFlashcardsData,
        loading: flashcardLoading,
        error: flashcardError,
    } = useFetch<IFlashcard[]>(`/flashcards/learning/${topicId}`);

    const currentFlashcard = flashcards ? flashcards[0] : null;

    const flashcardContainerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const isFrontRef = useRef<boolean>(true);

    const [shouldShowTrackingOptions, setShouldShowTrackingOptions] = useState<boolean>(false);
    const [cardsStudiedCount, setCardsStudiedCount] = useState<number>(0);
    const [correctAnswers, setCorrectAnswers] = useState<number>(0);
    const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
    
    // Use refs to access current values in cleanup
    const cardsStudiedRef = useRef<number>(0);
    const correctAnswersRef = useRef<number>(0);
    const sessionStartTimeRef = useRef<number>(Date.now());
    
    // Update refs when state changes
    useEffect(() => {
        cardsStudiedRef.current = cardsStudiedCount;
        correctAnswersRef.current = correctAnswers;
        sessionStartTimeRef.current = sessionStartTime;
    }, [cardsStudiedCount, correctAnswers, sessionStartTime]);

    // Start study session when component mounts
    useEffect(() => {
        const startTime = Date.now();
        setSessionStartTime(startTime);
        sessionStartTimeRef.current = startTime;
        
        if (topicId && currentFlashcard) {
            startStudySession(topicId as string, currentFlashcard.topicName);
        }
        
        // End session when component unmounts ONLY
        return () => {
            const accuracy = cardsStudiedRef.current > 0 ? (correctAnswersRef.current / cardsStudiedRef.current) * 100 : 0;
            endStudySession(cardsStudiedRef.current, accuracy);
            
            // Save final session data to database using context method
            // Don't mark as completed on unmount since user might be just leaving the page
            handleSaveTrackingProgressLearning({
                topicId: topicId as string,
                cardsStudied: cardsStudiedRef.current,
                correctAnswers: correctAnswersRef.current,
                sessionStartTime: sessionStartTimeRef.current,
                totalCards: flashcards?.length || 0,
                isTopicCompleted: false 
            })
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

    async function handleOnClickTrackingOption(qualityResponse: IQualityResponse) {
        if (!flashcards || !currentFlashcard) return;
        try {
            await putRequest(`/flashcards/${currentFlashcard.flashcardId}/track`, { qualityResponse });
            const flashcardsFiltered = flashcards.slice(1);
            setFlashcardsData(flashcardsFiltered);
            
            // Update learning tracking metrics
            const newCardsStudied = cardsStudiedCount + 1;
            const newCorrectAnswers = qualityResponse >= 3 ? correctAnswers + 1 : correctAnswers;
            
            setCardsStudiedCount(newCardsStudied);
            setCorrectAnswers(newCorrectAnswers);
            
            // If this was the last card, save progress to database using context method
            if (flashcardsFiltered.length === 0) {
                    await handleSaveTrackingProgressLearning({
                        topicId: topicId as string,
                        cardsStudied: newCardsStudied,
                        correctAnswers: newCorrectAnswers,
                        sessionStartTime: sessionStartTime,
                        totalCards: flashcards.length,
                        isTopicCompleted: true 
                    });
            }
            
        } catch (err) {
            toast({
                title: 'Tracking failed, please try again',
                variant: 'destructive',
            });
        }
    }
    

    if (flashcardLoading === true || flashcards === null || flashcards === undefined) {
        return <LoadingPage />;
    }

    if (flashcards.length === 0 || !currentFlashcard) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                        <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-black">Great job! 🎉</h2>
                    <p className="text-gray-700 max-w-md">
                        You've completed all the flashcards for this topic. There's nothing more to learn right now.
                    </p>
                    <div className="pt-4">
                        <button 
                            onClick={() => window.history.back()}
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors border border-gray-300"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (flashcardError) {
        return <div>Something went wrong with Flashcards</div>;
    }

    return (
        <FlashcardLearning
            topicName={currentFlashcard.topicName}
            total={flashcards.length}
            flashcardContainerRef={flashcardContainerRef}
            cardRef={cardRef}
            isFrontRef={isFrontRef}
            flashcard={currentFlashcard}
            handleManualFlip={handleManualFlip}
            shouldShowTrackingOptions={shouldShowTrackingOptions}
            handleOnClickTrackingOption={handleOnClickTrackingOption}
        />
    );
}
