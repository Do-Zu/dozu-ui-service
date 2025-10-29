import {
    IAnkiRating,
    IAnkiStatus,
    IBaseIntervalWithDeviation,
    INextReviewInterval,
    INextReviewIntervalForRating,
} from '@/types/anki';
import { IFlashcardStatus, IItemSpacedRepetition, IQualityResponse } from '@/types/itemSpacedRepetitionTracking.type';
import { TimeUnit } from '@/utils';

export interface IFlashcard {
    flashcardId: number;
    topicId: number;
    nodeId?: string | null;
    front: string;
    back: string;
    imageUrl?: string | null;
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

export type IFlashcardCreateInput = Pick<IFlashcard, 'front' | 'back'> & { image?: IImageSaveInput | null };
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

export type IFlashcardBatchResult = {
    flashcardsAdded: IFlashcard[];
    flashcardsUpdated: IFlashcard[];
};

export interface IImageSaveInput {
    id: string;
    url: string;
    downloadLocation: string;
}

export type ICardNextReviewSchedule = {
    flashcardId: number;
    nextReviewIntervalsForRating: INextReviewIntervalForRating[];
};

export type IDueAnkiCard = Pick<IFlashcard, 'flashcardId' | 'front' | 'back' | 'imageUrl' | 'topicName'> & {
    nextReviewDataByRatings: INextReviewDataByRating[];
    nextReview: string;
    status: IAnkiStatus;
};

export type IAnkiCardReviewed = Pick<IFlashcard, 'flashcardId'> & {
    nextReview: string;
    status: IAnkiStatus;
    nextReviewDataByRatings: INextReviewDataByRating[];
    rating: IAnkiRating;
};

export interface INextReviewDataByRating {
    rating: IAnkiRating;
    interval: INextReviewInterval;
    baseIntervalWithDeviation: IBaseIntervalWithDeviation | null;
}

export interface IAnkiCard {
    flashcardId: number;
    status: IFlashcardStatus;

    step: number | null; // should start at 0
    easinessFactor: string;
    lastReviewed: Date | null;
    nextReview: Date;
    reviewInterval: number;
}

export interface IAnkiResult extends IAnkiCard {
    nextReview: Date;
    nextReviewInterval: INextReviewInterval;
    baseIntervalWithDeviation: IBaseIntervalWithDeviation | null;
}

export type IAnkiCardStatusCounts = Record<Exclude<IAnkiStatus, IAnkiStatus.RELEARNING>, number>;
