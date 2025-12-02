import { IDueAnkiCard, IFlashcard, IFlashcardsBatchInput } from '@/app/[locale]/flashcards/types/flashcard.type';
import usePost from '@/hooks/usePost';
import flashcardService from '@/services/flashcard/flashcard.service';
import toastHelper from '@/utils/toast.helper';

export default function useBatchFlashcardsForNode(
    nodeId: string,
    { onSuccess }: { onSuccess?: (data: { flashcards: IFlashcard[]; dueAnkiCards: IDueAnkiCard[] }) => void },
) {
    const { loading, execute } = usePost<
        { topicId: number; flashcards: IFlashcardsBatchInput },
        { flashcards: IFlashcard[]; dueAnkiCards: IDueAnkiCard[] }
    >(
        ({ topicId, flashcards }) => flashcardService.batchFlashcardsForNodeState({ topicId, nodeId, flashcards }),
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
