import { getRequest, patchRequest, postRequest } from '@/api/api';
import { IUnspashImage } from '@/app/[locale]/flashcards/components/ImagesPreview';
import { IFlashcardWithReviewPrediction } from '@/app/[locale]/flashcards/learning/[topicId]/page';
import {
    IFlashcard,
    IImageSaveInput,
    IFlashcardsBatchInput,
    IFlashcardsForNodeBatchInput,
    IFlashcardsWithTopicName,
    IFlashcardBatchResult,
    IAnkiRating,
    IDueAnkiCard,
    IAnkiCardReviewed,
} from '@/app/[locale]/flashcards/types/flashcard.type';
import { IQualityResponse } from '@/types/itemSpacedRepetitionTracking.type';
import { flashcardRoutes } from '@/utils/constants/api.routes';

export interface IFlashcardReviewPayload {
    topicId: string | number;
    flashcardId: string | number;
    qualityResponse: IQualityResponse;
}

export interface IFlashcardReviewByAnkiPayload {
    topicId: string | number;
    flashcardId: string | number;
    rating: IAnkiRating;
}

class FlashcardService {
    public async getFlashcardsForTopic(topicId: string | number) {
        const response = await getRequest<unknown, IFlashcard[]>(
            flashcardRoutes(topicId).GET_FLASHCARDS_WITHOUT_TOPIC_INFO,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getFlashcardsWithTopicInfo(topicId: string | number) {
        const response = await getRequest<unknown, IFlashcardsWithTopicName>(
            flashcardRoutes(topicId).GET_FLASHCARDS_WITH_TOPIC_INFO,
        );

        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getDueFlashcardsForTopic(topicId: string | number) {
        const response = await getRequest<unknown, IFlashcardWithReviewPrediction[]>(
            flashcardRoutes(topicId).GET_DUE_FLASHCARDS,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getDueAnkiCardsForTopic(topicId: string | number) {
        const response = await getRequest<unknown, IDueAnkiCard[]>(
            flashcardRoutes(topicId).GET_DUE_FLASHCARDS,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async batchFlashcardsForTopic({
        topicId,
        flashcards,
    }: {
        topicId: string | number;
        flashcards: IFlashcardsBatchInput;
    }): Promise<IFlashcardBatchResult> {
        const response = await postRequest<IFlashcardsBatchInput, IFlashcardBatchResult>(
            flashcardRoutes(topicId).BATCH_FLASHCARDS,
            flashcards,
        );
        if (response.status != 'created') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async batchFlashcardsForNode({
        topicId,
        nodeId,
        flashcards,
    }: {
        topicId: string | number;
        nodeId: string;
        flashcards: IFlashcardsBatchInput;
    }) {
        const response = await postRequest<IFlashcardsForNodeBatchInput, {}>(
            flashcardRoutes(topicId).BATCH_FLASHCARDS_FOR_NODE,
            {
                nodeId,
                flashcards,
            },
        );
        if (response.status != 'created') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async reviewFlashcardWithQuality({ topicId, flashcardId, qualityResponse }: IFlashcardReviewPayload) {
        const response = await patchRequest<{ qualityResponse: IQualityResponse }, {}>(
            flashcardRoutes(topicId).REVIEW_FLASHCARD_WITH_QUALITY({ flashcardId }),
            { qualityResponse },
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async searchImages(search: string): Promise<IUnspashImage[]> {
        const response = await postRequest<{ search: string }, IUnspashImage[]>('/flashcards/search-images', {
            search,
        });
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async reviewFlashcardByAnki({ topicId, flashcardId, rating }: IFlashcardReviewByAnkiPayload) {
        const response = await patchRequest<{ rating: IAnkiRating }, IAnkiCardReviewed | null>(
            flashcardRoutes(topicId).REVIEW_FLASHCARD_WITH_QUALITY({ flashcardId }),
            { rating },
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new FlashcardService();
