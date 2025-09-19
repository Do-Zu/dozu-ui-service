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
}

export interface IFlashcardCounts {
    total?: number;
    new?: number;
    learning?: number; // SM-2 algorithm; including learning & RELEARNING states
    dueToday?: number;
}

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
