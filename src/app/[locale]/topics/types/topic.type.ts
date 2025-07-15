export interface ITopic {
    topicId: number;
    userId: number;
    name: string;
    description: string;
    createdAt: Date;
    classId?: number;
    imageUrl?: string;
    flashcardsCount?: number;
    flashcardsDueToday?: number;
    flashcardsNew?: number;
    hasProgress?: boolean;
    inputSetId?: number;
}

export type ICreateTopicBody = Pick<ITopic, 'name' | 'description'> & { inputSetId?: number };
export type ICreateTopicResponse = Pick<ITopic, 'topicId' | 'name' | 'description' | 'createdAt' | 'imageUrl'>;
export type IUpdateTopicBody = Pick<ITopic, 'name' | 'description'>;
export type IUpdateTopicResponse = Pick<ITopic, 'topicId' | 'name' | 'description'>;

export type ICreateTopicInClassBody = Pick<ITopic, 'name' | 'description'>;
export type ICreateTopicInClassResponse = ICreateTopicResponse;
