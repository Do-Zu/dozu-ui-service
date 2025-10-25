export type IClassFeedType = 'announcement' | 'new_content';

export interface IClassFeed {
    classFeedId: number;
    classId: number;
    senderId: string;
    type: IClassFeedType;
    title: string;
    content: string;
    link?: string | null;
    createdAt: string;
    updatedAt: string;

    sender?: {
        avatarUrl: string;
        fullName: string;
    };
}