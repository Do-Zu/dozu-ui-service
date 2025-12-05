import { useTranslations } from 'next-intl';
import React from 'react';
import FlashcardsEdit, { IEditingFlashcard } from '../edit/FlashcardsEdit';
import { useRequireFlashcards } from '../../../context/useRequireFlashcardContent';
import toastHelper from '@/utils/toast.helper';
import EmptyNodeFlashcards from './EmptyNodeFlashcards';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import useBatchFlashcardsForNode from '../../../hooks/flashcard/useBatchFlashcardsForNode';
import Generate from '../../generate/Generate';
import { IResponseFlashCardGenerate } from '../../../hooks/useFlashCardWorkSpace';
import flashcardEditUtils from '../../../utils/flashcard/flashcardEdit.utils';

interface Props {
    nodeId: string;
    onClose: () => void;
}

export default function NodeFlashcardsEdit({ nodeId, onClose }: Props) {
    const tCommon = useTranslations('common');
    const tFlashcardEdit = useTranslations('flashcard.edit');

    const { topicId } = useTopicWorkspace();
    const { flashcards } = useRequireFlashcards();
    const nodeFlashcards = flashcards.filter((item) => item.nodeId === nodeId);
    const { generatingFlashcards, setGeneratingFlashcards, onBatchFlashcardsSuccess } = useTopicWorkspace();

    const { loading, execute } = useBatchFlashcardsForNode(nodeId, {
        onSuccess(data) {
            onBatchFlashcardsSuccess(data);
            toastHelper.showSuccessMessage(tCommon('messages.updateSuccess', { name: 'Flashcards' }));
        },
    });

    async function handleSaveClick(nodeEditingFlashcards: IEditingFlashcard[]) {
        const data = flashcardEditUtils.prepareFlashcardsForSubmit(nodeEditingFlashcards);
        if (!data) {
            toastHelper.showSuccessMessage(tFlashcardEdit('messages.noFlashcardChanges'));
            return;
        }
        await execute({ topicId, data });
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
