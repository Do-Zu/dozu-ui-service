'use client';

import Axios from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckedState } from '@radix-ui/react-checkbox';
import { flashcardRoutes } from '@/utils/constants/api.routes';

export interface Flashcard {
    flashcardId: number;
    topicId: number;
    nodeId: string;
    front: string;
    back: string;
    createdAt: string; // Represents an ISO 8601 date string (e.g., "2025-06-20T08:13:41.017Z")
}

const AddFlashcardPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [selectedFlashcards, setSelectedFlashcards] = useState<number[]>([]);

    const topicId = searchParams.get('topicId');
    const nodeId = searchParams.get('nodeId');

    const [isEmpty, setIsEmpty] = useState(false);

    useEffect(() => {
        const getFlashcardsOfTopic = async () => {
            // const result = await Axios.get(flashcardRoutes(topicId!).GET_DUE_FLASHCARDS); // ! wrong logic
            const result = await Axios.get(flashcardRoutes(topicId!).GET_FLASHCARDS_WITHOUT_TOPIC_INFO);
            console.log(result.data.data);
            if (result.data.data.length == 0) {
                setIsEmpty(true);
            }
            setFlashcards(result.data.data);
        };
        getFlashcardsOfTopic();
    }, []);

    const handleOnCheckedSingle = (checked: CheckedState, flashcard: Flashcard) => {
        if (selectedFlashcards?.includes(flashcard.flashcardId)) {
            setSelectedFlashcards(
                selectedFlashcards.filter((flashcardIdItem) => flashcardIdItem !== flashcard.flashcardId),
            );
        } else {
            setSelectedFlashcards((prevFlashcards) => [...prevFlashcards, flashcard.flashcardId]);
        }
    };

    const checkIfSelected = (flashcardId: number, flashcardNodeId: string): boolean => {
        const selected = selectedFlashcards?.includes(flashcardId) || flashcardNodeId === nodeId;

        return selected;
    };

    const handleClickAdd = async () => {
        const options: any = {
            body: {
                FlashcardIds: selectedFlashcards,
            },
        };

        const response = await Axios.put(`/mindmap/${topicId}/nodes/${nodeId}`, options.body);
        console.log(response);
    };
    const router = useRouter();

    const handleAddFlashcardsToTopic = () => {
        router.push(`/flashcards/edit/${topicId}`);
    };

    return (
        <div className="w-full h-full">
            <h2 className="text-lg font-semibold mb-4">Flashcards</h2>
            {isEmpty ? (
                <>
                    {' '}
                    <div>No flashcard found</div>
                    <div>
                        <Button onClick={handleAddFlashcardsToTopic}>Add flashcards to topic</Button>
                    </div>
                </>
            ) : (
                <>
                    {' '}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[1%] px-2">
                                    {/* <Checkbox onCheckedChange={handleOnCheckedAll} /> */}
                                </TableHead>
                                <TableHead>Front</TableHead>
                                <TableHead>Back</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {flashcards.map((flashcard) => (
                                <TableRow key={flashcard.flashcardId}>
                                    <TableCell className="w-[1%] px-2">
                                        <Checkbox
                                            checked={checkIfSelected(flashcard.flashcardId, flashcard.nodeId)}
                                            onCheckedChange={(checked) => {
                                                handleOnCheckedSingle(checked, flashcard);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell className="max-w-[300px] whitespace-pre-wrap">
                                        {flashcard.front}
                                    </TableCell>
                                    <TableCell className="max-w-[300px] whitespace-pre-wrap">
                                        {flashcard.back}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button onClick={handleClickAdd}>Add to node</Button>
                </>
            )}
        </div>
    );
};

export default AddFlashcardPage;
