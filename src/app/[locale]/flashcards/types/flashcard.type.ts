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
    'status' | 'lastReviewed' | 'nextReview' | 'repetitionNumber' | 'easinessFactor' | 'reviewInterval' | 'step'
> & { flashcardId?: number };

export interface IQualityResponseNextReviewInterval {
    qualityResponse: IQualityResponse;
    nextReviewInterval: number;
}

export type IFlashcardCreateInput = Pick<IFlashcard, 'front' | 'back'> & { image?: IImageSaveInput | null };
export type IFlashcardUpdateInput = Pick<IFlashcard, 'flashcardId' | 'front' | 'back'> & {
    image?: IImageSaveInput | null;
};

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

export interface IUnspashImageSaveInput {
    type: 'unsplash';
    data: {
        id: string;
        url: string;
        downloadLocation: string;
    };
}

export interface IUploadImageSaveInput {
    type: 'upload';
    data: string;
}

export type IImageSaveInput = IUnspashImageSaveInput | IUploadImageSaveInput;

export type ICardNextReviewSchedule = {
    flashcardId: number;
    nextReviewIntervalsForRating: INextReviewIntervalForRating[];
};

export type IDueAnkiCard = Pick<IFlashcard, 'flashcardId' | 'front' | 'back' | 'imageUrl' | 'topicName' | 'nodeId'> & {
    learningState: IFlashcardLearningState;
    nextReview: string;
    status: IAnkiStatus;
};

export type IAnkiCardReviewed = Pick<IFlashcard, 'flashcardId'> & {
    learningState: IFlashcardLearningState;
    nextReview: string;
    status: IAnkiStatus;
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

export interface IUnspashImage {
    id: string;
    description: string | null;
    url: {
        thumb: string;
        small: string;
    };
    // user: Basic;
    links: {
        self: string;
        html: string;
        download: string;
        download_location: string;
    };
    width?: number;
    height?: number;
}
