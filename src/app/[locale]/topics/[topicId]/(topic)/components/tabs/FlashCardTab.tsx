import { useEffect } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import useFetch from '@/hooks/useFetch';
import LoadingPage from '@/app/loading';
import flashcardContentService, { IFlashcardContent } from '../../service/flashcardContent.service';
import flashcardUtils from '../../utils/flashcard.utils';
import FlashcardContent from '../flashcard/FlashcardContent';
import DataStatus from '@/components/errors/DataStatus';
import { isEmpty, isNil } from '@/utils';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { METHOD_LEARNING } from '@/utils/constants/method';

export default function FlashCardTab() {
    const {
        tab,
        topicId,
        flashcards,
        learningFlashcards,
        setTopic,
        setFlashcards,
        setLearningFlashcards,
        setAnkiSettings,
    } = useTopicWorkspace();

    const {
        data: flashcardContent,
        loading: flashcardContentLoading,
        error: flashcardContentError,
    } = useFetch<IFlashcardContent>(() => flashcardContentService.getFlashcardContent({ topicId }), {
        shouldRun: (isNil(flashcards) || isNil(learningFlashcards)) && tab === METHOD_LEARNING.FLASHCARD,
    });

    useEffect(() => {
        if (flashcardContent) {
            setFlashcards(flashcardContent.flashcards);
            setLearningFlashcards(flashcardContent.learningFlashcards);
            setAnkiSettings(flashcardContent.ankiSettings);
        }
    }, [flashcardContent]);

    useEffect(() => {
        if (!flashcards || !learningFlashcards) return;
        // recalculate flashcard counts
        setTopic((prev) => {
            if (!prev) return prev;
            const updatedFlashcardCounts = flashcardUtils.recalculateFlashcardCounts({
                flashcards,
                learningFlashcards,
            });
            return { ...prev, flashcardCounts: updatedFlashcardCounts };
        });
    }, [flashcards, learningFlashcards]);

    if (flashcardContentLoading) return <LoadingPage />;

    if (flashcardContentError) return <DataStatus variant="error" title={flashcardContentError} />;

    if (isNil(learningFlashcards) || isNil(flashcards)) return <DataStatus variant="empty" />;

    return <FlashcardContent mode={MODE_ACCESS_PAGE_ROLE.personal} />;
}
