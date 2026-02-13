import { useCallback, useMemo } from 'react';
import { useTopicWorkspace } from '../context/TopicWorkspaceContext';
import { IResponseFlashCardGenerate } from './useFlashCardWorkSpace';
import { useUpdateNoteAsync } from './useNote';
import { Button } from '@/components/ui/button';
import { METHOD_LEARNING } from '@/utils/constants/method';
import { FlashcardTabEnum } from '../components/flashcard/FlashcardContent';
import LoadingNode from '../components/common/LoadingNode';
import { Layers, ListChecks, NotebookText } from 'lucide-react';
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
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100"
                >
                    <Layers className="size-4" />
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
    const {
        topicId,
        selectingContentText,
        setGeneratingFlashcards,
        setTab,
        setFlashcardTab,
        note,
        getContentReference,
    } = useTopicWorkspace();

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
        const reference = getContentReference();
        const cleanedContent = getCleanedContent();

        // Escape HTML special characters in content
        const escapeHtml = (text: string) =>
            text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

        const escapedContent = escapeHtml(cleanedContent);

        // Create HTML with reference data embedded
        const htmlContent = reference
            ? `<p data-reference="${btoa(JSON.stringify(reference))}">${escapedContent}</p>`
            : `<p>${escapedContent}</p>`;

        // Append to existing content
        const currentContent = note?.content || '';
        const newContent = currentContent ? `${currentContent}<p></p>${htmlContent}` : htmlContent;
        await updateNoteAsync({ topicId, content: newContent });
    }, [note, getCleanedContent, updateNoteAsync, topicId, getContentReference]);

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
            <Button variant="ghost" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100">
                <ListChecks className="size-4" />
                Quiz
            </Button>
        ),
        [],
    );

    const AddToNoteComponent = useMemo(
        () => (
            <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100"
                onClick={onAddToNoteClick}
            >
                {updateNoteLoading ? (
                    <LoadingNode title="Saving" />
                ) : (
                    <>
                        <NotebookText className="size-4" />
                        Add to note
                    </>
                )}
            </Button>
        ),
        [onAddToNoteClick, updateNoteLoading],
    );

    return {
        generateFlashcards: GenerateFlashcardsComponent,
        generateQuiz: GenerateQuizComponent,
        addToNote: AddToNoteComponent,
    };
}
