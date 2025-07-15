export type IFlashcardStatus = 'new' | 'learning' | 'review';
export type IQualityResponse = 0 | 1 | 2 | 3 | 4 | 5;

export interface IQualityResponseNextReviewInterval {
    qualityResponse: IQualityResponse
    nextReviewInterval: number
}

export interface IFlashcardBasic {
    flashcardId: number
    topicId: number
    front: string
    back: string
}

export interface IFlashcard {
    front: string
    back: string
}

export type IFlashcardAdded = Pick<IFlashcardBasic, 'front' | 'back'>;
export type IFlashcardUpdated = Pick<IFlashcardBasic, 'flashcardId' | 'front' | 'back'>;
export type IFlashcardDeleted = number

export interface IFlashcardsBatch {
    flashcardsAdded: IFlashcardAdded[]
    flashcardsUpdated: IFlashcardUpdated[]
    flashcardsDeleted: IFlashcardDeleted[]
} 

export interface IFlashcardSpacedRepetition {
    flashcardId: number
    repetitionNumber: number
    easinessFactor: string
    reviewInterval: number
    lastReviewed: string | null
    nextReview: string | null
    status: IFlashcardStatus
}

export interface IFlashcardFull extends IFlashcardBasic, IFlashcardSpacedRepetition {
    topicName: string
}