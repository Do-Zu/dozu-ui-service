import { Layers, ListChecks, Loader2, NotebookText } from 'lucide-react';
import { useTopicWorkspace } from '../context/TopicWorkspaceContext';
import { useCallback } from 'react';
import Generate from '../components/generate/Generate';
import { Button } from '@/components/ui/button';
import { METHOD_LEARNING } from '@/utils/constants/method';
import { FlashcardTabEnum } from '../components/flashcard/FlashcardContent';
import { useUpdateNoteAsync } from './useNote';

function ProcessingNode() {
    return (
        <div className="flex flex-row gap-2 items-center text-muted-foreground whitespace-nowrap">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing ...</span>
        </div>
    );
}

interface GenerateFlashcardsProps {
    content: string;
    onGenerateFlashcardsSuccess: (data: any) => void;
}

function GenerateFlashcards({ content, onGenerateFlashcardsSuccess }: GenerateFlashcardsProps) {
    return (
        <Generate
            customContent={content}
            trigger={
                <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md">
                    <Layers className="h-4 w-4" />
                    Flashcards
                </Button>
            }
            type={METHOD_LEARNING.FLASHCARD}
            registerNode={<ProcessingNode />}
            generateNode={<ProcessingNode />}
            onSuccess={onGenerateFlashcardsSuccess}
        />
    );
}

export default function useSelectMenu() {
    const { topicId, selectingContentText, setGeneratingFlashcards, setTab, setFlashcardTab, note } =
        useTopicWorkspace();

    const getCleanedContent = useCallback(() => {
        return selectingContentText.replace(/\s+/g, ' ');
    }, [selectingContentText]);

    function onGenerateFlashcardsSuccess(data: any) {
        setGeneratingFlashcards(data);
        setTab(METHOD_LEARNING.FLASHCARD);
        setFlashcardTab(FlashcardTabEnum.EDIT);
    }

    const { updateNoteAsync, updateNoteLoading } = useUpdateNoteAsync();

    async function onAddToNoteClick() {
        const content = (note?.content || '').concat('<p></p>' + getCleanedContent());
        await updateNoteAsync({ topicId, content });
    }

    return {
        GenerateFlashcards: (
            <GenerateFlashcards
                content={getCleanedContent()}
                onGenerateFlashcardsSuccess={onGenerateFlashcardsSuccess}
            />
        ),
        GenerateQuiz: (
            <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md">
                <ListChecks className="h-4 w-4" />
                Quiz
            </Button>
        ),
        AddToNote: (
            <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={onAddToNoteClick}
            >
                {updateNoteLoading ? (
                    <ProcessingNode />
                ) : (
                    <>
                        <NotebookText className="h-4 w-4" />
                        Add to note
                    </>
                )}
            </Button>
        ),
    };
}
