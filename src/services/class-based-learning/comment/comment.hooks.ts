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
    TopicIdCommentNode,
} from './comment.types';
import { createComment, getCommentsByNode, getCommentReplies, getSingleComment } from './comment.service';
import { ApiResponse } from '@/api/type';
import { STATUS_CODE } from '@/utils/constants/http';

/**
 * Hook for getting comments by node
 * @param classId - The class ID
 * @param topicId - The topic ID
 * @param options - Additional options for the hook
 * @returns usePost hook result for getting comments
 */
export const useGetCommentsByNode = (
    classId: string | number,
    topicId: TopicIdCommentNode,
    options?: UsePostOptions<IGetCommentsQuery, ApiResponse<IGetCommentsResponse>>,
) => {
    return usePost<IGetCommentsQuery, ApiResponse<IGetCommentsResponse>>(
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
    topicId: TopicIdCommentNode,
    options?: UsePostOptions<ICreateCommentBody, ApiResponse<IClassTopicComment>>,
) => {
    return usePost<ICreateCommentBody, ApiResponse<IClassTopicComment>>(
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
    topicId: TopicIdCommentNode,
    options?: UsePostOptions<IGetSingleCommentBody, ApiResponse<IGetSingleCommentResponse>>,
) => {
    return usePost<IGetSingleCommentBody, ApiResponse<IGetSingleCommentResponse>>(
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
    topicId: TopicIdCommentNode,
    options?: UsePostOptions<IGetRepliesBody, ApiResponse<IGetRepliesResponse>>,
) => {
    return usePost<IGetRepliesBody, ApiResponse<IGetRepliesResponse>>(
        (repliesQuery) => getCommentReplies(classId, topicId, repliesQuery),
        'POST',
        options,
    );
};
