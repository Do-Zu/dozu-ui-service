import { TypeNodeComment } from '@/app/[locale]/class-based/types/class.type';

export interface IClassTopicComment {
    commentId: number | string;
    topicId: number | string;
    nodeId: number | string;
    author: {
        user_id: number;
        name: string;
        avatar: string;
    };
    typeNode: TypeNodeComment;
    isDeleted: boolean;
    parentCmtId?: number | string | null;
    level: number;
    content: string;
    reactionCount: number;
    replyCount: number;
    createdAt: Date;
    updatedAt: Date;
    replies?: IClassTopicComment[];
}

export interface ICreateCommentBody {
    nodeId: number | string;
    typeNode: TypeNodeComment;
    content: string;
    parentCmtId?: number | string | null;
    topicId: number | string;
    author: {
        user_id: number;
        name: string;
        avatar?: string;
    };
}

export interface IGetCommentsQuery {
    nodeId: number | string;
    typeNode: TypeNodeComment;
    page: number;
    limit?: number;
    includeReplies?: 'true' | 'false';
    parentCmtId?: number | string | null;
    level?: number;
}

export interface IGetSingleCommentBody {
    commentId: number | string;
}

export interface IGetRepliesBody {
    nodeId: number | string;
    typeNode: TypeNodeComment;
    parentCmtId: number | string;
    page: number;
    limit?: number;
}

// Response types
export type IGetCommentsResponse = IClassTopicComment[];
export type ICreateCommentResponse = IClassTopicComment;
export type IGetSingleCommentResponse = IClassTopicComment;
export type IGetRepliesResponse = IClassTopicComment[];
