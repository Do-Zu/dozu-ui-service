import { useCallback, useMemo } from 'react';
import { useTopicWorkspace } from '../context/TopicWorkspaceContext';
import { IResponseFlashCardGenerate } from './useFlashCardWorkSpace';
import { useUpdateNoteAsync } from './useNote';
import { Button } from '@/components/ui/button';
import { METHOD_LEARNING } from '@/utils/constants/method';
import { FlashcardTabEnum } from '../components/flashcard/FlashcardContent';
import LoadingNode from '../components/common/LoadingNode';
import { Layers, ListChecks, Loader2, NotebookText } from 'lucide-react';
import Generate from '../components/generate/Generate';
import DefaultGenerateButton from '../components/generate/DefaultGenerateButton';

interface GenerateFlashcardsProps {
    content: string;
    onGenerateFlashcardsSuccess: (data: IResponseFlashCardGenerate[]) => void;
}

function GenerateFlashcards({ content, onGenerateFlashcardsSuccess }: GenerateFlashcardsProps) {
    return (
        <Generate
            trigger={(startGenerate) => (
                <Button
                    onClick={() => startGenerate(content)}
                    variant="ghost"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                >
                    <Layers className="h-4 w-4" />
                    Flashcards
                </Button>
            )}
            customGenerateTrigger={(startGenerate) => <DefaultGenerateButton onClick={() => startGenerate(content)} />}
            type={METHOD_LEARNING.FLASHCARD}
            registerNode={<LoadingNode title="Generating" />}
            generateNode={<LoadingNode title="Generating" />}
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

    const onGenerateFlashcardsSuccess = useCallback(
        (data: IResponseFlashCardGenerate[]) => {
            setGeneratingFlashcards(data);
            setTab(METHOD_LEARNING.FLASHCARD);
            setFlashcardTab(FlashcardTabEnum.EDIT);
        },
        [setGeneratingFlashcards, setTab, setFlashcardTab],
    );

    const { updateNoteAsync, updateNoteLoading } = useUpdateNoteAsync();

    const onAddToNoteClick = useCallback(async () => {
        const content = (note?.content || '').concat('<p></p>' + getCleanedContent());
        await updateNoteAsync({ topicId, content });
    }, [note, getCleanedContent, updateNoteAsync, topicId]);

    const GenerateFlashcardsComponent = useMemo(
        () => (
            <GenerateFlashcards
                content={getCleanedContent()}
                onGenerateFlashcardsSuccess={onGenerateFlashcardsSuccess}
            />
        ),
        [getCleanedContent, onGenerateFlashcardsSuccess],
    );

    const GenerateQuizComponent = useMemo(
        () => (
            <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md">
                <ListChecks className="h-4 w-4" />
                Quiz
            </Button>
        ),
        [],
    );

    const AddToNoteComponent = useMemo(
        () => (
            <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={onAddToNoteClick}
            >
                {updateNoteLoading ? (
                    <LoadingNode title="Saving" />
                ) : (
                    <>
                        <NotebookText className="h-4 w-4" />
                        Add to note
                    </>
                )}
            </Button>
        ),
        [onAddToNoteClick, updateNoteLoading],
    );

    return {
        GenerateFlashcards: GenerateFlashcardsComponent,
        GenerateQuiz: GenerateQuizComponent,
        AddToNote: AddToNoteComponent,
    };
}
