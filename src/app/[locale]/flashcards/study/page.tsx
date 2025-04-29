'use client'

import { getRequest } from "@/api/api";
import useFetch from "@/hooks/useFetch";
import { useEffect, useState } from "react";
import Flashcard, { IFlashcard } from "../components/Flashcard";
import styles from './page.module.css';
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Edit } from "lucide-react";

const Page = () => {

    const router = useRouter();
    const searchParamsClient = useSearchParams();
    const topicId = searchParamsClient.get('topicId')!;
    const [initialFlashcardStatus, setInitialFlashcardStatus] = useState<'front' | 'back'>('front'); 

    const flashcardSelector = (data: { flashcards: IFlashcard[] }) => data.flashcards;

    const { 
        data: flashcards, 
        setData: setFlashcardData, 
        loading: flashcardLoading, 
        error: flashcardError 
    } 
        // = useFetch<{ flashcards: IFlashcard[] }>(`/topics/${topicId}/flashcards`);
        = useFetch<IFlashcard[]>(`/flashcards?topicId=${topicId}`, flashcardSelector);

    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
    const currentFlashcard = flashcards? flashcards[currentFlashcardIndex] : null;

    function handleBack() {
        if(currentFlashcardIndex > 0) setCurrentFlashcardIndex(prevIndex => prevIndex - 1);
    }

    function handleNext() {
        if(flashcards && currentFlashcardIndex < flashcards.length - 1) setCurrentFlashcardIndex(prevIndex => prevIndex + 1);
    }

    function handleClickEdit() {
        router.push(`/en/flashcards/edit?topicId=${topicId}`);
    }

    function handleSetInitialFlashcardStatus() {
        setInitialFlashcardStatus(prevStatus => {
            return prevStatus === 'front' ? 'back' : 'front';
        })
    }

    if(flashcardLoading === true || !flashcards || !currentFlashcard) {
        return (
            <div>Loading flashcards...</div>
        )
    }

    if(flashcardError) {
        return (
            <div>Something went wrong with Flashcards</div>
        )
    }

    return (
        <div className="flex flex-col gap-4" style={{ height: '90vh', padding: '10px 30px' }}>
            <div style={{ color: '#1F2937', fontSize: 24, fontWeight: 'bold' }}>My Flashcards</div>

            <div className="grid grid-cols-11 gap-6 w-full h-full bg-white"> 
                <div style={{ borderRadius: 12 }} className="col-span-8 flex flex-col items-center justify-center bg-gray-100">
                    <div className="flex flex-col w-full h-full justify-center items-center gap-4">
                        {<Flashcard flashcard={currentFlashcard} initialStatus={initialFlashcardStatus}/>}
                        <div style={{ display: 'flex', flexDirection: 'row', gap: 18, marginTop: 20, alignItems: 'center' }}>
                            <button onClick={handleBack} className={`${styles['circle-button']} ${styles.x}`}>X</button>
                            <div>{currentFlashcardIndex + 1} / { flashcards.length} </div>
                            <button onClick={handleNext} className={`${styles['circle-button']} ${styles.check}`}>✓</button>
                        </div>
                    </div>
                </div>

                <div style={{ borderRadius: 12 }} className="col-span-3 flex flex-row bg-gray-100 p-4 gap-4">
                    <Edit style={{ cursor: 'pointer' }} onClick={handleClickEdit}/>
                    <BookOpen style={{ cursor: 'pointer' }} onClick={handleSetInitialFlashcardStatus} />
                </div>
            </div>
        </div>
    )
}

export default Page;