'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import useFetch from '@/hooks/useFetch';
import FlashcardEditor, { handleConvertToFlashcardsEdited } from '../../components/FlashcardEditor';
import { IFlashcardBasic } from '../../types/flashcard.type';
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
    const params = useParams();
    if (!params?.topicId) return <div>No topic id is provided</div>;

    const { topicId } = params as { topicId: string };

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

    if (flashcardsError) {
        return <div>Error: {flashcardsError} </div>;
    }

    if (flashcardsLoading) {
        return <LoadingPage />;
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
