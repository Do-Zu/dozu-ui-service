import usePost, { UsePostOptions } from '@/hooks/usePost';
import {
    IClassTopicComment,
    ICreateCommentBody,
    IGetCommentsQuery,
    IGetCommentsResponse,
    IGetRepliesBody,
    IGetRepliesResponse,
    IGetSingleCommentBody,
    IGetSingleCommentResponse,
} from './comment.types';
import { createComment, getCommentsByNode, getCommentReplies, getSingleComment } from './comment.service';

/**
 * Hook for getting comments by node
 * @param classId - The class ID
 * @param topicId - The topic ID
 * @param options - Additional options for the hook
 * @returns usePost hook result for getting comments
 */
export const useGetCommentsByNode = (
    classId: string | number,
    topicId: string | number,
    options?: UsePostOptions<IGetCommentsQuery, IGetCommentsResponse>,
) => {
    return usePost<IGetCommentsQuery, IGetCommentsResponse>(
        (query) => getCommentsByNode(classId, topicId, query),
        'POST',
        options,
    );
};

/**
 * Hook for creating a new comment
 * @param classId - The class ID
 * @param topicId - The topic ID
 * @param options - Additional options for the hook
 * @returns usePost hook result for creating comments
 */
export const useCreateComment = (
    classId: string | number,
    topicId: string | number,
    options?: UsePostOptions<ICreateCommentBody, IClassTopicComment>,
) => {
    return usePost<ICreateCommentBody, IClassTopicComment>(
        (commentData) => createComment(classId, topicId, commentData),
        'POST',
        options,
    );
};

/**
 * Hook for getting a single comment
 * @param classId - The class ID
 * @param topicId - The topic ID
 * @param options - Additional options for the hook
 * @returns usePost hook result for getting single comment
 */
export const useGetSingleComment = (
    classId: string | number,
    topicId: string | number,
    options?: UsePostOptions<IGetSingleCommentBody, IGetSingleCommentResponse>,
) => {
    return usePost<IGetSingleCommentBody, IGetSingleCommentResponse>(
        (commentQuery) => getSingleComment(classId, topicId, commentQuery),
        'POST',
        options,
    );
};

/**
 * Hook for getting comment replies
 * @param classId - The class ID
 * @param topicId - The topic ID
 * @param options - Additional options for the hook
 * @returns usePost hook result for getting replies
 */
export const useGetCommentReplies = (
    classId: string | number,
    topicId: string | number,
    options?: UsePostOptions<IGetRepliesBody, IGetRepliesResponse>,
) => {
    return usePost<IGetRepliesBody, IGetRepliesResponse>(
        (repliesQuery) => getCommentReplies(classId, topicId, repliesQuery),
        'POST',
        options,
    );
};
