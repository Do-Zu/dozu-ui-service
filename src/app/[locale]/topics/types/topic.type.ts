export interface ITopic {
    topicId: number;
    userId: number;
    name: string;
    description: string;
    createdAt: Date;
    classId?: number;
    imageUrl?: string;
    flashcardCounts?: IFlashcardCounts;
    hasProgress?: boolean;
    inputSetId?: number;
    itemTrackings: ItemTracking[];
}

export interface ItemTracking {
    itemId: number; // Unique identifier for the learning item
    type: 'flashcard' | 'note' | 'quiz'; // Type of learning material
    createdAt: string; // ISO timestamp when the item was added
    repetitionNumber: number; // Number of successful reviews so far
    easinessFactor: number; // SM2 EF score (ease of recall, default 2.5)
    reviewInterval: number; // Days until next review
    lastReviewed: string; // ISO timestamp of the most recent review
    nextReview: string; // ISO timestamp for the next scheduled review
    status: 'learning' | 'reviewing' | 'mastered'; // Current learning stage
    step: number; // Step within initial learning phase
}

export type IFlashcardCounts = {
    new: number;
    learning: number;
    review: number;
    total: number;
};

export type ICreateTopicBody = Pick<ITopic, 'name' | 'description'> & {
    inputSetId?: number;
    imageFile?: File | null;
};
export type ICreateTopicResponse = Pick<ITopic, 'topicId' | 'name' | 'description' | 'createdAt' | 'imageUrl'>;
export type IUpdateTopicBody = Pick<ITopic, 'name' | 'description'> & { imageFile?: File | null };
export type IUpdateTopicResponse = Pick<ITopic, 'topicId' | 'name' | 'description' | 'imageUrl'>;

export type ICreateTopicForClassBody = Pick<ITopic, 'name' | 'description'> & {
    inputSetId?: number;
    imageFile?: File | null;
};
export type ICreateTopicForClassResponse = ICreateTopicResponse;
