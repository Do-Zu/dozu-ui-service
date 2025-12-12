// Types for public comments (assignment and learning material comments)

export interface IPublicComment {
    commentId: number;
    senderId: number;
    content: string;
    parentCommentId: number | null;
    createdAt: string | Date;
    updatedAt: string | Date | null;
    sender?: {
        userId: number;
        username: string;
        fullName: string | null;
        avatarUrl: string | null;
    };
    replies?: IPublicComment[];
}

export interface ICreatePublicCommentBody {
    content: string;
    parentCommentId?: number;
}

export interface IUpdatePublicCommentBody {
    content: string;
}

export interface IGetCommentsQuery {
    page?: number;
    limit?: number;
}

export interface IGetCommentsResponse {
    comments: IPublicComment[];
    page: number;
    limit: number;
    total: number;
}

export interface IGetSingleCommentQuery {
    commentId: number;
}

// Response types
export type ICreateCommentResponse = IPublicComment;
export type IGetSingleCommentResponse = IPublicComment;

