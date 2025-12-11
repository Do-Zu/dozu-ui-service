import { deleteRequest, getRequest, postRequest, putRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import {
    ICreatePublicCommentBody,
    ICreateCommentResponse,
    IGetCommentsQuery,
    IGetCommentsResponse,
    IGetSingleCommentQuery,
    IGetSingleCommentResponse,
    IPublicComment,
    IUpdatePublicCommentBody,
} from './publicComment.types';

/**
 * Base URL for assignment comments API
 */
const getAssignmentCommentsBaseUrl = (classId: number, assignmentId: number) =>
    `/classes/${classId}/assignments/${assignmentId}/comments`;

/**
 * Base URL for learning material comments API
 */
const getLearningMaterialCommentsBaseUrl = (classId: number, learningMaterialId: number) =>
    `/classes/${classId}/learning-material/${learningMaterialId}/comments`;

/**
 * Base URL for submission comments API
 */
const getSubmissionCommentsBaseUrl = (assignmentId: number, submissionId: number) =>
    `/assignments/${assignmentId}/submissions/${submissionId}/comments`;

/**
 * Base URL for general comments API
 */
const getCommentBaseUrl = (commentId: number) => `/comments/${commentId}`;

/**
 * Get comments for an assignment
 */
export const getAssignmentComments = async (
    classId: number,
    assignmentId: number,
    query: IGetCommentsQuery,
): Promise<ApiResponse<IGetCommentsResponse>> => {
    const url = getAssignmentCommentsBaseUrl(classId, assignmentId);
    return getRequest<IGetCommentsQuery, IGetCommentsResponse>(url, {
        params: query,
    });
};

/**
 * Create a comment for an assignment
 */
export const createAssignmentComment = async (
    classId: number,
    assignmentId: number,
    commentData: ICreatePublicCommentBody,
): Promise<ApiResponse<ICreateCommentResponse>> => {
    const url = getAssignmentCommentsBaseUrl(classId, assignmentId);
    return postRequest<ICreatePublicCommentBody, ICreateCommentResponse>(url, commentData);
};

/**
 * Get comments for a learning material
 */
export const getLearningMaterialComments = async (
    classId: number,
    learningMaterialId: number,
    query: IGetCommentsQuery,
): Promise<ApiResponse<IGetCommentsResponse>> => {
    const url = getLearningMaterialCommentsBaseUrl(classId, learningMaterialId);
    return getRequest<IGetCommentsQuery, IGetCommentsResponse>(url, {
        params: query,
    });
};

/**
 * Create a comment for a learning material
 */
export const createLearningMaterialComment = async (
    classId: number,
    learningMaterialId: number,
    commentData: ICreatePublicCommentBody,
): Promise<ApiResponse<ICreateCommentResponse>> => {
    const url = getLearningMaterialCommentsBaseUrl(classId, learningMaterialId);
    return postRequest<ICreatePublicCommentBody, ICreateCommentResponse>(url, commentData);
};

/**
 * Get comments for a submission (private comments)
 */
export const getSubmissionComments = async (
    assignmentId: number,
    submissionId: number,
    query: IGetCommentsQuery,
): Promise<ApiResponse<IGetCommentsResponse>> => {
    const url = getSubmissionCommentsBaseUrl(assignmentId, submissionId);
    return getRequest<IGetCommentsQuery, IGetCommentsResponse>(url, {
        params: query,
    });
};

/**
 * Create a comment for a submission (private comment)
 */
export const createSubmissionComment = async (
    assignmentId: number,
    submissionId: number,
    commentData: ICreatePublicCommentBody,
): Promise<ApiResponse<ICreateCommentResponse>> => {
    const url = getSubmissionCommentsBaseUrl(assignmentId, submissionId);
    return postRequest<ICreatePublicCommentBody, ICreateCommentResponse>(url, commentData);
};

/**
 * Get a single comment by ID
 */
export const getCommentById = async (
    query: IGetSingleCommentQuery,
): Promise<ApiResponse<IGetSingleCommentResponse>> => {
    const url = getCommentBaseUrl(query.commentId);
    return getRequest<unknown, IGetSingleCommentResponse>(url);
};

/**
 * Update a comment
 */
export const updateComment = async (
    commentId: number,
    commentData: IUpdatePublicCommentBody,
): Promise<ApiResponse<IPublicComment>> => {
    const url = getCommentBaseUrl(commentId);
    return putRequest<IUpdatePublicCommentBody, IPublicComment>(url, commentData);
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: number): Promise<ApiResponse<void>> => {
    const url = getCommentBaseUrl(commentId);
    return deleteRequest<unknown, ApiResponse<void>>(url);
};

/**
 * Service object for assignment comment operations
 */
export const assignmentCommentService = {
    getComments: getAssignmentComments,
    createComment: createAssignmentComment,
};

/**
 * Service object for learning material comment operations
 */
export const learningMaterialCommentService = {
    getComments: getLearningMaterialComments,
    createComment: createLearningMaterialComment,
};

/**
 * Service object for general public comment operations
 */
export const publicCommentService = {
    getCommentById,
    updateComment,
    deleteComment,
    getSubmissionComments,
    createSubmissionComment,
};

