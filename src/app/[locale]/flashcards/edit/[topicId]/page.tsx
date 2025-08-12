'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import useFetch from '@/hooks/useFetch';
import FlashcardEditor, { handleConvertToFlashcardsEdited } from '../../components/FlashcardEditor';
import LoadingPage from '@/app/loading';
import flashcardService from '@/services/flashcard/flashcard.service';
import { ApiResponse } from '@/api/type';
import { IFlashcardsWithTopicName } from '../../types/flashcard.type';

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

const Page = () => {
    const params = useParams();
    if (!params?.topicId) return <div>No topic id is provided</div>;

    const { topicId } = params as { topicId: string };

    const {
        data: flashcardsFromResponse,
        loading: apiLoading,
        error: apiError,
    } = useFetch<IFlashcardsWithTopicName>(() => flashcardService.getFlashcardsWithTopicInfo(topicId));

    const [flashcards, setFlashcards] = useState<IFlashcardWithServer[]>();

    useEffect(() => {
        if (!flashcardsFromResponse) return;
        const flashcards = handleConvertToFlashcardsEdited({
            type: 'manual',
            flashcardsProp: flashcardsFromResponse,
        });
        setFlashcards(flashcards);
    }, [flashcardsFromResponse]);

    if (apiError) {
        return <div>Error: {apiError} </div>;
    }

    if (apiLoading) {
        return <LoadingPage />;
    }

    if (flashcards === null || flashcards === undefined) {
        return <div>Flashcards is empty</div>;
    }

    return (
        <FlashcardEditor
            flashcards={flashcards}
            setFlashcards={setFlashcards}
            topic={{ topicId, name: flashcardsFromResponse!.topicName }}
        />
    );
};

export default Page;
