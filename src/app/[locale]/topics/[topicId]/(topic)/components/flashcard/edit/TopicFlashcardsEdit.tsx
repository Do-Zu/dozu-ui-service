import { useTranslations } from 'next-intl';
import React from 'react';
import FlashcardsEdit, { IEditingFlashcard, ILocalFlashcard } from '../edit/FlashcardsEdit';
import { useRequireFlashcards, useRequireLearningFlashcards } from '../../../context/useRequireFlashcardContent';
import toastHelper from '@/utils/toast.helper';
import flashcardUtils, { initialFlashcardsCount } from '../../../utils/flashcard.utils';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import Generate from '../../generate/Generate';
import { IResponseFlashCardGenerate } from '../../../hooks/useFlashCardWorkSpace';
import useBatchFlashcardsForTopic from '../../../hooks/flashcard/useBatchFlashcardsForTopic';

export default function TopicFlashcardsEdit() {
    const tCommon = useTranslations('common');
    const tFlashcardEdit = useTranslations('flashcard.edit');

    const { topicId } = useTopicWorkspace();
    const { flashcards, setFlashcards } = useRequireFlashcards();
    const { setLearningFlashcards } = useRequireLearningFlashcards();
    const { generatingFlashcards, setGeneratingFlashcards } = useTopicWorkspace();

    const { loading, execute } = useBatchFlashcardsForTopic({
        onSuccess(data) {
            setFlashcards(data.flashcards);
            setLearningFlashcards(data.dueAnkiCards);
            setGeneratingFlashcards(null);
            toastHelper.showSuccessMessage(tCommon('messages.updateSuccess', { name: 'Flashcards' }));
        },
    });

    async function handleSaveClick(editingFlashcards: IEditingFlashcard[]) {
        const flashcardsSubmitted = flashcardUtils.prepareFlashcardsForSubmit(editingFlashcards);
        if (!flashcardsSubmitted) {
            toastHelper.showSuccessMessage(tFlashcardEdit('messages.noFlashcardChanges'));
            return;
        }
        await execute({ topicId, flashcards: flashcardsSubmitted });
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
