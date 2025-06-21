'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import useFetch from '@/hooks/useFetch';
import FlashcardEditor, { handleConvertToFlashcardsEdited } from '../components/FlashcardEditor';
import { IFlashcardBasic } from '../flashcard.type';
import LoadingPage from '@/app/loading';

interface IFlashcard {
    id: number;
    front: string;
    back: string;
}

interface IFlashcardServer {
    flashcardId: number;
    topicId: number;
    isUpdated: boolean;
    isDeleted: boolean;
}

interface IFlashcardWithServer extends IFlashcard {
    serverInfo?: IFlashcardServer;
}

interface IFlashcardsWithTopicName {
    flashcards: IFlashcardBasic[];
    topicName: string;
}

const Page = () => {
    const searchParamsClient = useSearchParams();
    if (!searchParamsClient) {
        return <div>Loading or invalid context...</div>;
    }

    const topicId = searchParamsClient.get('topicId')!;

    const {
        data: flashcardsExisted,
        loading: flashcardsLoading,
        error: flashcardsError,
    } = useFetch<IFlashcardsWithTopicName>(`/flashcards?topicId=${topicId}`);

    const [flashcards, setFlashcards] = useState<IFlashcardWithServer[]>();

    useEffect(() => {
        if (!flashcardsExisted) return;
        const flashcards = handleConvertToFlashcardsEdited({
            type: 'manual',
            flashcardsProp: flashcardsExisted,
        });
        setFlashcards(flashcards);
    }, [flashcardsExisted]);

    if (flashcardsLoading) {
        return <LoadingPage />;
    }

    if (flashcardsError) {
        return <div>Error: {flashcardsError} </div>;
    }

    if (flashcards === null || flashcards === undefined) {
        return <div>Flashcards is empty</div>;
    }

    return (
        <FlashcardEditor
            flashcards={flashcards}
            setFlashcards={setFlashcards}
            topic={{ topicId, name: flashcardsExisted!.topicName }}
        />
    );
};

export default Page;
