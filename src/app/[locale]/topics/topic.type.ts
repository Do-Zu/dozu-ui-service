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
}

export type ICreateTopicRequest = Pick<ITopic, 'name' | 'description'>;
export type ICreateTopicResponse = Pick<ITopic, 'topicId' | 'name' | 'description' | 'createdAt' | 'imageUrl'>;
export type IUpdateTopicRequest = Pick<ITopic, 'topicId' | 'name' | 'description'>;
export type IUpdateTopicResponse = Pick<ITopic, 'topicId' | 'name' | 'description'>;

export type ICreateTopicInClassRequest = Pick<ITopic, 'classId' | 'name' | 'description'>;
export type ICreateTopicInClassResponse = ICreateTopicResponse;
