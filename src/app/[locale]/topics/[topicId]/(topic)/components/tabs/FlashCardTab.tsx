import { useEffect } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import useFetch from '@/hooks/useFetch';
import LoadingPage from '@/app/loading';
import flashcardContentService, { IFlashcardContent } from '../../service/flashcardContent.service';
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
        ankiSettings,
        setAnkiSettings,
    } = useTopicWorkspace();

    const {
        data: flashcardContent,
        loading: flashcardContentLoading,
        error: flashcardContentError,
    } = useFetch<IFlashcardContent>(() => flashcardContentService.getFlashcardContent({ topicId }), {
        shouldRun:
            (isNil(flashcards) || isNil(learningFlashcards) || isNil(ankiSettings)) &&
            tab === METHOD_LEARNING.FLASHCARD,
    });

    useEffect(() => {
        if (flashcardContent) {
            setFlashcards(flashcardContent.flashcards);
            setLearningFlashcards(flashcardContent.learningFlashcards);
            setAnkiSettings(flashcardContent.ankiSettings);
        }
    }, [flashcardContent]);

    if (flashcardContentLoading) return <LoadingPage />;

    if (flashcardContentError) return <DataStatus variant="error" title={flashcardContentError} />;

    if (isNil(learningFlashcards) || isNil(flashcards) || isNil(ankiSettings)) return <DataStatus variant="empty" />;

    return <FlashcardContent mode={MODE_ACCESS_PAGE_ROLE.personal} />;
}
