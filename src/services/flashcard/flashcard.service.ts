import { getRequest, patchRequest, postRequest } from '@/api/api';
import { IUnspashImage } from '@/app/[locale]/topics/[topicId]/(topic)/components/flashcard/flashcard-image/ImagesPreview';
import {
    IFlashcard,
    IImageSaveInput,
    IFlashcardsBatchInput,
    IFlashcardsForNodeBatchInput,
    IFlashcardsWithTopicName,
    IFlashcardBatchResult,
    IDueAnkiCard,
    IAnkiCardReviewed,
    IAnkiResult,
    IFlashcardLearningState,
    INextReviewDataByRating,
    IAnkiCard,
} from '@/app/[locale]/flashcards/types/flashcard.type';
import { IAnkiRating } from '@/types/anki';
import { IQualityResponse } from '@/types/itemSpacedRepetitionTracking.type';
import { flashcardRoutes } from '@/utils/constants/api.routes';
import { activityTrackingService } from '@/services/gamification/activityTracking.service';
import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';
import AnkiService from '../anki/anki.service';

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

    public async getDueAnkiCardsForTopic(topicId: string | number) {
        const response = await getRequest<unknown, IDueAnkiCard[]>(flashcardRoutes(topicId).GET_DUE_FLASHCARDS);
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

        // Track flashcard review activity for streak
        const score = this.calculateFlashcardScore(qualityResponse);
        await activityTrackingService.trackFlashcardReview(
            Number(flashcardId),
            score,
            0, // Duration - you might want to track this in the future
        );

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
     * Convert quality response to score (0-100)
     */
    private calculateFlashcardScore(qualityResponse: IQualityResponse): number {
        // Quality response mapping to score:
        // 0: Complete blackout -> 0
        // 1: Incorrect; easy interval -> 20
        // 2: Incorrect; normal interval -> 40
        // 3: Correct; difficult -> 60
        // 4: Correct; normal -> 80
        // 5: Correct; easy -> 100
        const scoreMap = {
            0: 0, // Complete blackout
            1: 20, // Incorrect; easy interval
            2: 40, // Incorrect; normal interval
            3: 60, // Correct; difficult
            4: 80, // Correct; normal
            5: 100, // Correct; easy
        };

        return scoreMap[qualityResponse as keyof typeof scoreMap] || 0;
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

    public async batchFlashcardsForTopicState({
        topicId,
        flashcards,
    }: {
        topicId: number;
        flashcards: IFlashcardsBatchInput;
    }): Promise<{ flashcards: IFlashcard[]; dueAnkiCards: IDueAnkiCard[] }> {
        const response = await postRequest<
            IFlashcardsBatchInput,
            { flashcards: IFlashcard[]; dueAnkiCards: IDueAnkiCard[] }
        >(`/topics/${topicId}/flashcards/batch/state`, flashcards);
        if (response.status != 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async batchFlashcardsForNodeState({
        topicId,
        nodeId,
        flashcards,
    }: {
        topicId: number;
        nodeId: string;
        flashcards: IFlashcardsBatchInput;
    }): Promise<{ flashcards: IFlashcard[]; dueAnkiCards: IDueAnkiCard[] }> {
        const response = await postRequest<
            IFlashcardsForNodeBatchInput,
            { flashcards: IFlashcard[]; dueAnkiCards: IDueAnkiCard[] }
        >(`/topics/${topicId}/flashcards/batch/node/state`, { nodeId, flashcards });
        if (response.status != 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async toggleStar(topicId: string | number, flashcardId: string | number): Promise<{ flashcardId: number; isStar: boolean }> {
        const response = await patchRequest<unknown, { flashcardId: number; isStar: boolean }>(
            `/topics/${topicId}/flashcards/${flashcardId}/toggle-star`,
            {}
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
            const ankiService = new AnkiService(ankiSetting);
            const ankiResult = ankiService.schedule(ankiCard, rating);
            result.push({
                rating,
                interval: ankiResult.nextReviewInterval,
                baseIntervalWithDeviation: ankiResult.baseIntervalWithDeviation,
            });
        }

        return result;
    }
}

export default new FlashcardService();
