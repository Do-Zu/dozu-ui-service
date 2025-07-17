'use client';

import { useEffect, useRef, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { putRequest } from '@/api/api';
import { IFlashcardFull, IQualityResponse, IQualityResponseNextReviewInterval } from '../../types/flashcard.type';
import LoadingPage from '@/app/loading';
import { FlashcardLearning } from '../components/FlashcardLearning';
import { useParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export type IFlashcard = Pick<IFlashcardFull, 'flashcardId' | 'front' | 'back' | 'topicName'> & {
    qualityResponsesNextReviewInterval: IQualityResponseNextReviewInterval[];
};

export default function Page() {
    const params = useParams();
    if (!params?.topicId) return <div>No topic id is provided</div>;

    const { topicId } = params;

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
