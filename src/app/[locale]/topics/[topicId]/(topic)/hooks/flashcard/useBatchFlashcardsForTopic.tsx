import {
    IBatchFlashcardsInTopicPayload,
    IBatchFlashcardsInTopicResult,
} from '@/app/[locale]/flashcards/types/flashcard.type';
import usePost from '@/hooks/usePost';
import flashcardService from '@/services/flashcard/flashcard.service';
import toastHelper from '@/utils/toast.helper';

export default function useBatchFlashcardsForTopic({
    onSuccess,
}: {
    onSuccess?: (data: IBatchFlashcardsInTopicResult) => void;
}) {
    const { loading, execute } = usePost<IBatchFlashcardsInTopicPayload, IBatchFlashcardsInTopicResult>(
        ({ topicId, data }) => flashcardService.batchFlashcardsInTopic({ topicId, data }),
        'POST',
        {
            onError(error) {
                toastHelper.showErrorMessage(error);
            },
            onSuccess(data) {
                onSuccess?.(data);
            },
        },
    );

    return { loading, execute };
}
