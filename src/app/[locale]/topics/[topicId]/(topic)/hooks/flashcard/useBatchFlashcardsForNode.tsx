import {
    IBatchFlashcardsInTopicData,
    IBatchFlashcardsInTopicPayload,
    IBatchFlashcardsInTopicResult,
} from '@/app/[locale]/flashcards/types/flashcard.type';
import usePost from '@/hooks/usePost';
import flashcardService from '@/services/flashcard/flashcard.service';
import toastHelper from '@/utils/toast.helper';

export default function useBatchFlashcardsForNode(
    nodeId: string,
    { onSuccess }: { onSuccess?: (data: IBatchFlashcardsInTopicResult) => void },
) {
    const { loading, execute } = usePost<IBatchFlashcardsInTopicPayload, IBatchFlashcardsInTopicResult>(
        ({ topicId, data }) => {
            const dataWithNodeId: IBatchFlashcardsInTopicData = {
                createInputs: data.createInputs.map((item) => ({ ...item, nodeId })),
                updateInputs: data.updateInputs.map((item) => ({ ...item, nodeId })),
                deleteIds: data.deleteIds,
            };

            return flashcardService.batchFlashcardsInTopic({ topicId, data: dataWithNodeId });
        },
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
