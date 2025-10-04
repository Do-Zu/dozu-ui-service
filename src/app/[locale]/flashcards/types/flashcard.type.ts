import { IItemSpacedRepetition, IQualityResponse } from '@/types/itemSpacedRepetitionTracking.type';
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

export enum IAnkiRating {
    AGAIN = 1,
    HARD = 2,
    GOOD = 3,
    EASY = 4,
}

export enum IAnkiStatus {
    NEW = 'new',
    LEARNING = 'learning',
    REVIEW = 'review',
    RELEARNING = 'relearning',
}

export interface INextReviewInterval {
    interval: number;
    timeUnit: TimeUnit;
}

export interface INextReviewIntervalForRating {
    rating: IAnkiRating;
    interval: INextReviewInterval;
}

export type ICardNextReviewSchedule = {
    flashcardId: number;
    nextReviewIntervalsForRating: INextReviewIntervalForRating[];
};

export type IDueAnkiCard = Pick<IFlashcard, 'flashcardId' | 'front' | 'back' | 'imageUrl' | 'topicName'> & {
    nextReviewSchedule: ICardNextReviewSchedule;
    nextReview: string;
    status: IAnkiStatus;
};

export type IAnkiCardReviewed = Pick<IFlashcard, 'flashcardId'> & {
    nextReview: string;
    status: IAnkiStatus;
    nextReviewSchedule: ICardNextReviewSchedule;
    rating: IAnkiRating;
};
