'use client'

import { useEffect, useRef, useState } from "react";
import Flashcard, { IFlashcard } from "../components/Flashcard";
import { Angry, ArrowBigLeft, CircleAlert, Eye, Frown, Laugh, Smile, ThumbsUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import useFetch from "@/hooks/useFetch";
import { Button } from "@/components/ui/button";
import { putRequest } from "@/api/api";
import { useRouter } from "next/navigation";
import BackButton from "../components/BackButton";

type TrackingOption = {
    icon: any, 
    label: string,
    qualityResponse: 0 | 1 | 2 | 3 | 4 | 5
}

const trackingOptions: TrackingOption[] = [
    { icon: <Angry size={24} fill="red"/>, label: 'Fail', qualityResponse: 0 },
    { icon: <Frown size={24} fill="#F6C908"/>, label: 'Incorrect', qualityResponse: 1 },
    { icon: <CircleAlert size={24} fill="#FFCC4D"/>, label: 'Easy miss', qualityResponse: 2 },
    { icon: <ThumbsUp size={24} fill="blue" />, label: 'Hard', qualityResponse: 3 },
    { icon: <Smile size={24} fill="yellow"/>, label: 'Good', qualityResponse: 4 },
    { icon: <Laugh size={24} fill="yellow"/>, label: 'Easy', qualityResponse: 5 },
]

const userId = 2;

interface IQualityResponseNextReviewInterval {
    qualityResponse: 0 | 1 | 2 | 3 | 4 | 5
    nextReviewInterval: number
}

interface IFlashcardExtended extends IFlashcard {
    topicName: string
    qualityResponsesNextReviewInterval: IQualityResponseNextReviewInterval[]
}

export default function Page() {

    const router = useRouter();
    const flashcardSelector = (data: { flashcards: IFlashcardExtended[] }) => data.flashcards;

    const { 
        data: flashcards, 
        setData: setFlashcardData, 
        loading: flashcardLoading, 
        error: flashcardError 
    }  = useFetch<IFlashcardExtended[]>(`/flashcards/practice?userId=${userId}`, flashcardSelector);

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
        if(cardRef.current) {
            cardRef.current.style.transition = 'none';
            cardRef.current.style.transform = 'rotateX(0deg)';

            setTimeout(() => {
                if(cardRef.current) cardRef.current.style.transition = 'transform 0.6s';
            }, 100);
        }
        setShouldShowTrackingOptions(false);
        
    }, [flashcards]);

    function handleManualFlip() {
        if(isFrontRef.current) {
            setShouldShowTrackingOptions(true);
        } else {
            return;
        }

        // if(cardRef.current && !autoPlayEnabled) {
        if(cardRef.current) {
            cardRef.current.style.transform = isFrontRef.current ? 'rotateX(180deg)': 'rotateX(0deg)';
            // setIsFront(prev => !prev);
            isFrontRef.current = !isFrontRef.current;
        }
    }

    function renderTrackingOptionsSection(style: string) {
        return (
            <div className={style}>
                {trackingOptions.map((option, index) => {
                    const nextReviewInterval = currentFlashcard
                        ?.qualityResponsesNextReviewInterval
                        .find((element) => element.qualityResponse === option.qualityResponse)
                        ?.nextReviewInterval
                        
                    return (
                        <div 
                            key={index}
                            className="col-span-2 h-full flex flex-col gap-0 justify-center items-center rounded-lg bg-[#fff] cursor-pointer"
                            onClick={() => handleClickTrackingOption(option.qualityResponse)}
                        >
                            {option.icon}
                            <Label className="text-lg">{option.label}</Label>
                            <Label className="text-sm text-gray-500">{nextReviewInterval} {nextReviewInterval === 1 ? 'day' : 'days'}</Label>
                        </div>
                    )
                })}
            </div>
        )
    }

    function renderShowAnswerSection(style: string) {
        return (
            <div className={style}>
                <Button onClick={handleManualFlip} className="flex flex-row items-center">
                    <Eye/>
                    <div>Show answer</div>
                </Button>
            </div>
        )
    }

    async function handleClickTrackingOption(qualityResponse: 0 | 1 | 2 | 3 | 4 | 5) {
        if(!flashcards || !currentFlashcard) return;
        try {
            const data = await putRequest(`/flashcards/${currentFlashcard.flashcardId}/track`, {qualityResponse});
            // console.log(data);
            const flashcardsFiltered = flashcards.slice(1);
            // console.log(flashcardsFiltered);
            setFlashcardData(flashcardsFiltered);
        } catch(err) {
            console.log(err);
        }
    }

    function handleClickBack() {
        router.back();
    }

    if(flashcardLoading === true || flashcards === null || flashcards === undefined) {
        return (
            <div>Loading flashcards...</div>
        )
    }

    if(flashcards.length === 0 || !currentFlashcard) {
        return (
            <div>Nothing to Practice</div>
        )
    }

    if(flashcardError) {
        return (
            <div>Something went wrong with Flashcards</div>
        )
    }

    console.log('Flashcards: ', flashcards);
    return (
        <div className="flex bg-[#F3F4F6] h-[95vh]">
            <div className="flex flex-1 flex-col m-1.25 mb-0 p-5">
                <div className="bg-[#fff] p-2.5">
                    <BackButton  />
                </div>
                <div className="flex flex-1 bg-[#F9FAFB] p-5 grid grid-cols-11 gap-5">
                    <div className="bg-[#F3F4F6] col-span-11 flex flex-col items-center">
                        <div className="w-[50%] flex flex-row justify-between mt-6">
                            <div className="text-gray-500">Topic: 
                                <span className="text-black font-medium"> {currentFlashcard.topicName}</span>
                            </div>
                            <div className="text-gray-500">
                                <span className="text-black font-medium">{flashcards.length} </span>
                                flashcards remaining...
                            </div>
                        </div>
                        <Flashcard 
                            style="flex w-[50%] h-[75%] mt-2" 
                            cardContainerRef={flashcardContainerRef} 
                            cardRef={cardRef}
                            flashcard={currentFlashcard}
                        />
                        {
                            shouldShowTrackingOptions ? 
                                renderTrackingOptionsSection('grid grid-cols-12 gap-6 mt-2 mt-4 mb-4 w-[70%] h-[20%]') : 
                                renderShowAnswerSection('mt-4')
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}