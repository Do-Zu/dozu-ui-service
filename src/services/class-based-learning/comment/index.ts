// Export types
export type {
    IClassTopicComment,
    ICreateCommentBody,
    IGetCommentsQuery,
    IGetSingleCommentBody,
    IGetRepliesBody,
    IGetCommentsResponse,
    ICreateCommentResponse,
    IGetSingleCommentResponse,
    IGetRepliesResponse,
} from './comment.types';

// Export service functions
export { getCommentsByNode, createComment, getSingleComment, getCommentReplies } from './comment.service';

// Export hooks
export { useGetCommentsByNode, useCreateComment, useGetSingleComment, useGetCommentReplies } from './comment.hooks';
