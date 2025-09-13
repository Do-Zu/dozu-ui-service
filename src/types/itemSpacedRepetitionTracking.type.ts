export type IItemType = 'flashcard' | 'question';
export type IItemStatus = 'new' | 'learning' | 'review' | 'relearning';
export type IFlashcardStatus = IItemStatus;

export interface IItemSpacedRepetition {
    itemId: number;
    userId: number;
    topicId: number;
    type: IItemType;
    createdAt: Date;
    repetitionNumber: number;
    easinessFactor: string;
    reviewInterval: number;
    lastReviewed: string | null;
    nextReview: string;
    status: IFlashcardStatus;
}

export type IQualityResponse = 0 | 1 | 2 | 3 | 4 | 5;

export type ICreateTrackingRecord = Pick<IItemSpacedRepetition, 'userId' | 'topicId' | 'itemId' | 'type'>;
