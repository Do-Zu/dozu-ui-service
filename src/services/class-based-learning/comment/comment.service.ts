import { postRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import {
    ICreateCommentBody,
    ICreateCommentResponse,
    IGetCommentsQuery,
    IGetCommentsResponse,
    IGetRepliesBody,
    IGetRepliesResponse,
    IGetSingleCommentBody,
    IGetSingleCommentResponse,
    TopicIdCommentNode,
} from './comment.types';

/**
 * Base URL for class topic comments API
 * @param classId - The class ID
 * @param topicId - The topic ID
 * @returns Base URL string
 */
const getBaseUrl = (classId: string | number, topicId: TopicIdCommentNode) =>
    `/classes/${encodeURIComponent(String(classId))}/topics/comments`;

/**
 * Get comments for a specific node
 * @param classId - The class ID
 * @param topicId - The topic ID
 * @param query - Query parameters for getting comments
 * @returns Promise with comments data
 */
export const getCommentsByNode = async (
    classId: string | number,
    topicId: TopicIdCommentNode,
    query: IGetCommentsQuery,
): Promise<ApiResponse<IGetCommentsResponse>> => {
    const url = `${getBaseUrl(classId, topicId)}/node-comments`;
    return postRequest<IGetCommentsQuery, IGetCommentsResponse>(url, query);
};

/**
 * Create a new comment or reply
 * @param classId - The class ID
 * @param topicId - The topic ID
 * @param commentData - Comment data to create
 * @returns Promise with created comment data
 */
export const createComment = async (
    classId: string | number,
    topicId: TopicIdCommentNode,
    commentData: ICreateCommentBody,
): Promise<ApiResponse<ICreateCommentResponse>> => {
    const url = `${getBaseUrl(classId, topicId)}/add`;
    return postRequest<ICreateCommentBody, ICreateCommentResponse>(url, commentData);
};

/**
 * Get a single comment by ID
 * @param classId - The class ID
 * @param topicId - The topic ID
 * @param commentQuery - Query with comment ID
 * @returns Promise with comment data
 */
export const getSingleComment = async (
    classId: string | number,
    topicId: TopicIdCommentNode,
    commentQuery: IGetSingleCommentBody,
): Promise<ApiResponse<IGetSingleCommentResponse>> => {
    const url = `${getBaseUrl(classId, topicId)}/single-comment`;
    return postRequest<IGetSingleCommentBody, IGetSingleCommentResponse>(url, commentQuery);
};

/**
 * Get replies for a specific comment
 * @param classId - The class ID
 * @param topicId - The topic ID
 * @param repliesQuery - Query parameters for getting replies
 * @returns Promise with replies data
 */
export const getCommentReplies = async (
    classId: string | number,
    topicId: TopicIdCommentNode,
    repliesQuery: IGetRepliesBody,
): Promise<ApiResponse<IGetRepliesResponse>> => {
    const url = `${getBaseUrl(classId, topicId)}/replies`;
    return postRequest<IGetRepliesBody, IGetRepliesResponse>(url, repliesQuery);
};
