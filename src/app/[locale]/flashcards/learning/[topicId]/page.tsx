'use client';

import { useEffect, useRef, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { putRequest, postRequest } from '@/api/api';
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
    const { startStudySession, endStudySession, getStudyMetrics } = useUserTrackingContext();

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
            
            // Save final session data to database
            saveLearningProgressToDB();
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

    // Save learning progress to database
    const saveLearningProgressToDB = async () => {
       
            const timeSpent = Date.now() - sessionStartTimeRef.current;
            const accuracy = cardsStudiedRef.current > 0 ? (correctAnswersRef.current / cardsStudiedRef.current) * 100 : 0;
            
            // Ensure minimum time if cards were studied (simulate realistic study time)
            const minTimePerCard = 10000; // 10 seconds per card minimum
            const simulatedTime = cardsStudiedRef.current > 0 ? 
                Math.max(timeSpent, cardsStudiedRef.current * minTimePerCard) : timeSpent;
            

            const response = await postRequest('/progress/learning-tracking', {
                topicId: topicId,
                contentType: 'flashcard',
                timeSpent: simulatedTime, // in milliseconds
                isCompleted: cardsStudiedRef.current > 0,
                cardsStudied: cardsStudiedRef.current,
                accuracy: accuracy,
                sessionData: {
                    startTime: sessionStartTimeRef.current,
                    endTime: Date.now(),
                    totalCards: flashcards?.length || 0,
                    actualTimeSpent: timeSpent,
                    simulatedTimeSpent: simulatedTime
                }
            });
            
    
            
            // Optional: Trigger a data refresh on the progress page
            // You can implement this by dispatching a custom event
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('progressUpdated'));
            }
    };

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
            
            // If this was the last card, save progress to database
            if (flashcardsFiltered.length === 0) {
                await saveLearningProgressToDB();
            }
            
            // Save progress to database after each card (optional - could be optimized to batch)
            // Uncomment if you want real-time saving:
            // await saveLearningProgressToDB();
            
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
        return <div>Nothing to Learn</div>;
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
