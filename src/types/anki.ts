import { TimeUnit } from '@/utils';

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

export type IBaseIntervalWithDeviation = {
    baseInterval: number;
    deviation: number;
};
