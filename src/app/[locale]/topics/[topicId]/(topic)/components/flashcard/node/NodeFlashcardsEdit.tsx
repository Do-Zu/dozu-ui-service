import { useTranslations } from 'next-intl';
import React from 'react';
import FlashcardsEdit, { IEditingFlashcard, ILocalFlashcard } from '../edit/FlashcardsEdit';
import { useRequireFlashcards, useRequireLearningFlashcards } from '../../../context/useRequireFlashcardContent';
import toastHelper from '@/utils/toast.helper';
import flashcardUtils, { initialFlashcardsCount } from '../../../utils/flashcard.utils';
import EmptyNodeFlashcards from './EmptyNodeFlashcards';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import useBatchFlashcardsForNode from '../../../hooks/flashcard/useBatchFlashcardsForNode';
import Generate from '../../generate/Generate';
import { IResponseFlashCardGenerate } from '../../../hooks/useFlashCardWorkSpace';

interface Props {
    nodeId: string;
    onClose: () => void;
}

export default function NodeFlashcardsEdit({ nodeId, onClose }: Props) {
    const tCommon = useTranslations('common');
    const tFlashcardEdit = useTranslations('flashcard.edit');

    const { topicId } = useTopicWorkspace();
    const { flashcards, setFlashcards } = useRequireFlashcards();
    const { setLearningFlashcards } = useRequireLearningFlashcards();
    const nodeFlashcards = flashcards.filter((item) => item.nodeId === nodeId);
    const { generatingFlashcards, setGeneratingFlashcards } = useTopicWorkspace();

    const { loading, execute } = useBatchFlashcardsForNode(nodeId, {
        onSuccess(data) {
            setFlashcards(data.flashcards);
            setLearningFlashcards(data.dueAnkiCards);
            setGeneratingFlashcards(null);
            toastHelper.showSuccessMessage(tCommon('messages.updateSuccess', { name: 'Flashcards' }));
        },
    });

    async function handleSaveClick(nodeEditingFlashcards: IEditingFlashcard[]) {
        const flashcardsSubmitted = flashcardUtils.prepareFlashcardsForSubmit(nodeEditingFlashcards);
        if (!flashcardsSubmitted) {
            toastHelper.showSuccessMessage(tFlashcardEdit('messages.noFlashcardChanges'));
            return;
        }
        await execute({ topicId, flashcards: flashcardsSubmitted });
    }

    return (
        <FlashcardsEdit
            flashcards={nodeFlashcards}
            generatingFlashcards={generatingFlashcards}
            emptyComponent={<EmptyNodeFlashcards onClose={onClose} />}
            generateComponent={
                <Generate
                    type="flashcard"
                    onSuccess={(data: IResponseFlashCardGenerate[]) => {
                        setGeneratingFlashcards(data);
                    }}
                />
            }
            isSaving={loading}
            onSaveClick={handleSaveClick}
            onClose={onClose}
        />
    );
}
