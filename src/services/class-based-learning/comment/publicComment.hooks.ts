import { useCallback, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import usePost, { UsePostOptions } from '@/hooks/usePost';
import {
    createAssignmentComment,
    createLearningMaterialComment,
    createSubmissionComment,
    deleteComment,
    getAssignmentComments,
    getCommentById,
    getLearningMaterialComments,
    getSubmissionComments,
    updateComment,
} from './publicComment.service';
import {
    ICreatePublicCommentBody,
    IGetCommentsQuery,
    IGetCommentsResponse,
    IGetSingleCommentQuery,
    IGetSingleCommentResponse,
    IPublicComment,
    IUpdatePublicCommentBody,
} from './publicComment.types';
import { ApiResponse } from '@/api/type';

/**
 * Hook to get comments for an assignment
 */
export function useAssignmentComments(
    classId?: number,
    assignmentId?: number,
    page: number = 1,
    limit: number = 20,
) {
    const query: IGetCommentsQuery = { page, limit };
    const {
        data: response,
        loading,
        error,
        refetch,
    } = useFetch<ApiResponse<IGetCommentsResponse>>(
        () => {
            if (!classId || !assignmentId) return Promise.resolve(null);
            return getAssignmentComments(classId, assignmentId, query);
        },
        { shouldRun: !!classId && !!assignmentId },
    );

    return {
        comments: response?.data?.comments || [],
        page: response?.data?.page || page,
        limit: response?.data?.limit || limit,
        total: response?.data?.total || 0,
        loading,
        error,
        refetch,
    };
}

/**
 * Hook to create a comment for an assignment
 */
export function useCreateAssignmentComment(
    classId?: number,
    assignmentId?: number,
    options?: UsePostOptions<ICreatePublicCommentBody, ApiResponse<IPublicComment>>,
) {
    const { execute, loading, error, data } = usePost<ICreatePublicCommentBody, ApiResponse<IPublicComment>>(
        (commentData) => {
            if (!classId || !assignmentId) {
                throw new Error('classId and assignmentId are required');
            }
            return createAssignmentComment(classId, assignmentId, commentData);
        },
        'POST',
        options,
    );

    const createComment = useCallback(
        async (commentData: ICreatePublicCommentBody) => {
            const result = await execute(commentData);
            return result?.data || null;
        },
        [execute],
    );

    return {
        createComment,
        loading,
        error,
        data: data?.data || null,
    };
}

/**
 * Hook to get comments for a learning material
 */
export function useLearningMaterialComments(
    classId?: number,
    learningMaterialId?: number,
    page: number = 1,
    limit: number = 20,
) {
    const query: IGetCommentsQuery = { page, limit };
    const {
        data: response,
        loading,
        error,
        refetch,
    } = useFetch<ApiResponse<IGetCommentsResponse>>(
        () => {
            if (!classId || !learningMaterialId) return Promise.resolve(null);
            return getLearningMaterialComments(classId, learningMaterialId, query);
        },
        { shouldRun: !!classId && !!learningMaterialId },
    );

    return {
        comments: response?.data?.comments || [],
        page: response?.data?.page || page,
        limit: response?.data?.limit || limit,
        total: response?.data?.total || 0,
        loading,
        error,
        refetch,
    };
}

/**
 * Hook to create a comment for a learning material
 */
export function useCreateLearningMaterialComment(
    classId?: number,
    learningMaterialId?: number,
    options?: UsePostOptions<ICreatePublicCommentBody, ApiResponse<IPublicComment>>,
) {
    const { execute, loading, error, data } = usePost<ICreatePublicCommentBody, ApiResponse<IPublicComment>>(
        (commentData) => {
            if (!classId || !learningMaterialId) {
                throw new Error('classId and learningMaterialId are required');
            }
            return createLearningMaterialComment(classId, learningMaterialId, commentData);
        },
        'POST',
        options,
    );

    const createComment = useCallback(
        async (commentData: ICreatePublicCommentBody) => {
            const result = await execute(commentData);
            return result?.data || null;
        },
        [execute],
    );

    return {
        createComment,
        loading,
        error,
        data: data?.data || null,
    };
}

/**
 * Hook to get comments for a submission (private comments)
 */
export function useSubmissionComments(
    assignmentId?: number,
    submissionId?: number,
    page: number = 1,
    limit: number = 20,
) {
    const query: IGetCommentsQuery = { page, limit };
    const {
        data: response,
        loading,
        error,
        refetch,
    } = useFetch<ApiResponse<IGetCommentsResponse>>(
        () => {
            if (!assignmentId || !submissionId) return Promise.resolve(null);
            return getSubmissionComments(assignmentId, submissionId, query);
        },
        { shouldRun: !!assignmentId && !!submissionId },
    );

    return {
        comments: response?.data?.comments || [],
        page: response?.data?.page || page,
        limit: response?.data?.limit || limit,
        total: response?.data?.total || 0,
        loading,
        error,
        refetch,
    };
}

/**
 * Hook to create a comment for a submission (private comment)
 */
export function useCreateSubmissionComment(
    assignmentId?: number,
    submissionId?: number,
    options?: UsePostOptions<ICreatePublicCommentBody, ApiResponse<IPublicComment>>,
) {
    const { execute, loading, error, data } = usePost<ICreatePublicCommentBody, ApiResponse<IPublicComment>>(
        (commentData) => {
            if (!assignmentId || !submissionId) {
                throw new Error('assignmentId and submissionId are required');
            }
            return createSubmissionComment(assignmentId, submissionId, commentData);
        },
        'POST',
        options,
    );

    const createComment = useCallback(
        async (commentData: ICreatePublicCommentBody) => {
            const result = await execute(commentData);
            return result?.data || null;
        },
        [execute],
    );

    return {
        createComment,
        loading,
        error,
        data: data?.data || null,
    };
}

/**
 * Hook to get a single comment by ID
 */
export function useCommentById(commentId?: number) {
    const {
        data: response,
        loading,
        error,
        refetch,
    } = useFetch<ApiResponse<IGetSingleCommentResponse>>(
        () => {
            if (!commentId) return Promise.resolve(null);
            return getCommentById({ commentId });
        },
        { shouldRun: !!commentId },
    );

    return {
        comment: response?.data,
        loading,
        error,
        refetch,
    };
}

/**
 * Hook to update a comment
 */
export function useUpdateComment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateCommentFn = useCallback(
        async (commentId: number, commentData: IUpdatePublicCommentBody) => {
            try {
                setLoading(true);
                setError(null);
                const response = await updateComment(commentId, commentData);
                if (response.status !== 'success') {
                    throw new Error(response.message);
                }
                return response.data;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to update comment';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return {
        updateComment: updateCommentFn,
        loading,
        error,
    };
}

/**
 * Hook to delete a comment
 */
export function useDeleteComment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteCommentFn = useCallback(async (commentId: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await deleteComment(commentId);
            if (response.status !== 'success') {
                throw new Error(response.message);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        deleteComment: deleteCommentFn,
        loading,
        error,
    };
}

