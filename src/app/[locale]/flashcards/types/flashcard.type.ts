import { IItemSpacedRepetition, IQualityResponse } from '@/types/itemSpacedRepetitionTracking.type';

export interface IFlashcard {
    flashcardId: number;
    topicId: number;
    nodeId?: string | null;
    front: string;
    back: string;
    createdAt: Date;
    learningState?: IFlashcardLearningState;

    topicName?: string;
}

export interface IFlashcardsWithTopicName {
    flashcards: IFlashcard[];
    topicName: string;
}

export type IFlashcardLearningState = Pick<
    IItemSpacedRepetition,
    'status' | 'lastReviewed' | 'nextReview' | 'repetitionNumber' | 'easinessFactor' | 'reviewInterval'
> & { flashcardId?: number };

export interface IQualityResponseNextReviewInterval {
    qualityResponse: IQualityResponse;
    nextReviewInterval: number;
}

export type IFlashcardCreateInput = Pick<IFlashcard, 'front' | 'back'>;
export type IFlashcardUpdateInput = Pick<IFlashcard, 'flashcardId' | 'front' | 'back'>;

export type IFlashcardsBatchInput = {
    flashcardsAdded?: IFlashcardCreateInput[];
    flashcardsUpdated?: IFlashcardUpdateInput[];
    flashcardsDeleted?: number[];
};

export type IFlashcardsForNodeBatchInput = {
    nodeId: string;
    flashcards: IFlashcardsBatchInput;
};