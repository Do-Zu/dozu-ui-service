export interface ITopic {
    topicId: number;
    userId: number;
    name: string;
    description: string;
    createdAt: Date;
    imageUrl?: string;
}

export type ITopicBasic = Pick<ITopic, 'topicId' | 'name' | 'description' | 'imageUrl'>;
export type ITopicAdded = Pick<ITopic, 'userId' | 'name' | 'description'>;
export type ITopicUpdated = Pick<ITopic, 'name' | 'description'>;

export type ITopicForUser = ITopicBasic & { flashcardsCount?: number; flashcardsDueToday?: number };
export type ITopicsForUserReturned = ITopicForUser[];
