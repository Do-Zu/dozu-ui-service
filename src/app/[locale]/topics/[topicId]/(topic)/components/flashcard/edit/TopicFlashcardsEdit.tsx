import { useTranslations } from 'next-intl';
import React from 'react';
import FlashcardsEdit, { IEditingFlashcard } from '../edit/FlashcardsEdit';
import { useRequireFlashcards } from '../../../context/useRequireFlashcardContent';
import toastHelper from '@/utils/toast.helper';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import Generate from '../../generate/Generate';
import { IResponseFlashCardGenerate } from '../../../hooks/useFlashCardWorkSpace';
import useBatchFlashcardsForTopic from '../../../hooks/flashcard/useBatchFlashcardsForTopic';
import flashcardEditUtils from '../../../utils/flashcard/flashcardEdit.utils';

export default function TopicFlashcardsEdit() {
    const tCommon = useTranslations('common');
    const tFlashcardEdit = useTranslations('flashcard.edit');

    const { topicId } = useTopicWorkspace();
    const { flashcards } = useRequireFlashcards();
    const { generatingFlashcards, setGeneratingFlashcards, onBatchFlashcardsSuccess } = useTopicWorkspace();

    const { loading, execute } = useBatchFlashcardsForTopic({
        onSuccess(data) {
            onBatchFlashcardsSuccess(data);
            toastHelper.showSuccessMessage(tCommon('messages.updateSuccess', { name: 'Flashcards' }));
        },
    });

    async function handleSaveClick(editingFlashcards: IEditingFlashcard[]) {
        const data = flashcardEditUtils.prepareFlashcardsForSubmit(editingFlashcards);
        if (!data) {
            toastHelper.showSuccessMessage(tFlashcardEdit('messages.noFlashcardChanges'));
            return;
        }
        await execute({ topicId, data });
    }

    return (
        <FlashcardsEdit
            flashcards={flashcards}
            generatingFlashcards={generatingFlashcards}
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
        />
    );
}
