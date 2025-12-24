import { deleteRequest, getRequest, patchRequest, postRequest } from '@/api/api';
import {
    IFlashcard,
    IFlashcardsBatchInput,
    IFlashcardsForNodeBatchInput,
    IFlashcardBatchResult,
    IDueAnkiCard,
    IAnkiCardReviewed,
    IFlashcardLearningState,
    INextReviewDataByRating,
    IAnkiCard,
    IUnspashImage,
    ICreateFlashcardsForTopicPayload,
    IUpdateFlashcardsInTopicPayload,
    IDeleteFlashcardsInTopicPayload,
    InsertFlashcardsBody,
    IUpdateFlashcardsBody,
    IBatchFlashcardsInTopicPayload,
    IBatchFlashcardsInTopicResult,
} from '@/app/[locale]/flashcards/types/flashcard.type';
import { IAnkiRating } from '@/types/anki';
import { IQualityResponse } from '@/types/itemSpacedRepetitionTracking.type';
import { activityTrackingService } from '@/services/gamification/activityTracking.service';
import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';
import { ApiResponse } from '@/api/type';
import AnkiScheduler from '../anki/implementation/anki-scheduler';
import AnkiService from '../anki/application/anki.service';

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
        const response = await getRequest<unknown, IFlashcard[]>(`/topics/${topicId}/flashcards?includeTopic=false`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getDueAnkiCardsForTopic(topicId: string | number) {
        const response = await getRequest<unknown, IDueAnkiCard[]>(`/topics/${topicId}/flashcards/v2/learning`);
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
            `/topics/${topicId}/flashcards/batch/changes`,
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
            `/topics/${topicId}/flashcards/batch/node`,
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
            `/topics/${topicId}/flashcards/${flashcardId}/review`,
            { rating },
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }

        // Track flashcard review activity for streak
        try {
            const score = this.calculateAnkiScore(rating);
            await activityTrackingService.trackFlashcardReview(
                Number(flashcardId),
                score,
                0, // Duration - you might want to track this in the future
            );
        } catch (error) {
            console.error('Error tracking flashcard review activity:', error);
        }

        return response.data;
    }

    /**
     * Convert Anki rating to score (0-100)
     */
    private calculateAnkiScore(rating: IAnkiRating): number {
        // Anki rating mapping to score:
        // 1: Again -> 0
        // 2: Hard -> 40
        // 3: Good -> 80
        // 4: Easy -> 100
        const scoreMap = {
            1: 0, // Again
            2: 40, // Hard
            3: 80, // Good
            4: 100, // Easy
        };

        return scoreMap[rating as keyof typeof scoreMap] || 0;
    }

    public async toggleStar(
        topicId: string | number,
        flashcardId: string | number,
    ): Promise<{ flashcardId: number; isStar: boolean }> {
        const response = await patchRequest<unknown, { flashcardId: number; isStar: boolean }>(
            `/topics/${topicId}/flashcards/${flashcardId}/toggle-star`,
            {},
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public getNextReviewByRatings(
        flashcardId: number,
        learningState: IFlashcardLearningState,
        ankiSetting: IAnkiSetting,
    ): INextReviewDataByRating[] {
        if (!learningState) {
            throw new Error('Flashcard does not have learningState');
        }
        let result: INextReviewDataByRating[] = [];

        let rating = IAnkiRating.AGAIN;
        for (; rating <= IAnkiRating.EASY; ++rating) {
            const ankiCard: IAnkiCard = {
                ...learningState,
                step: learningState.step,
                flashcardId,
                lastReviewed: learningState.lastReviewed ? new Date(learningState.lastReviewed) : null,
                nextReview: new Date(learningState.nextReview),
            };
            const ankiScheduler = new AnkiScheduler(ankiSetting);
            const ankiService = new AnkiService(ankiScheduler);
            const ankiResult = ankiService.schedule(ankiCard, rating);
            result.push({
                rating,
                interval: ankiResult.nextReviewInterval,
                baseIntervalWithDeviation: ankiResult.baseIntervalWithDeviation,
            });
        }

        return result;
    }

    public async createFlashcardsForTopic({ topicId, flashcards }: ICreateFlashcardsForTopicPayload) {
        if (flashcards.length === 0) {
            return [];
        }
        const response = await postRequest<{ flashcards: InsertFlashcardsBody }, IFlashcard[]>(
            `/topics/${topicId}/flashcards/v2`,
            { flashcards },
        );
        if (response.status !== 'created') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async updateFlashcardsInTopic({ topicId, flashcards }: IUpdateFlashcardsInTopicPayload) {
        if (flashcards.length === 0) {
            return [];
        }
        const response = await patchRequest<{ flashcards: IUpdateFlashcardsBody }, IFlashcard[]>(
            `/topics/${topicId}/flashcards/v2`,
            { flashcards },
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async deleteFlashcardsInTopic({ topicId, flashcards }: IDeleteFlashcardsInTopicPayload) {
        if (flashcards.length === 0) {
            return [];
        }
        const response = await deleteRequest<{ flashcards: number[] }, ApiResponse<number[]>>(
            `/topics/${topicId}/flashcards/v2`,
            { flashcards },
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    // new version of batching flashcards in topic function
    public async batchFlashcardsInTopic({ topicId, data }: IBatchFlashcardsInTopicPayload) {
        const result = await Promise.all([
            this.createFlashcardsForTopic({ topicId, flashcards: data.createInputs }),
            this.updateFlashcardsInTopic({ topicId, flashcards: data.updateInputs }),
            this.deleteFlashcardsInTopic({ topicId, flashcards: data.deleteIds }),
        ]);

        return {
            createdFlashcards: result[0],
            updatedFlashcards: result[1],
            deletedFlashcards: result[2],
        } as IBatchFlashcardsInTopicResult;
    }
}

export default new FlashcardService();
