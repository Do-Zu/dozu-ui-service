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

// Export public comment types
export type {
    IPublicComment,
    ICreatePublicCommentBody,
    IUpdatePublicCommentBody,
} from './publicComment.types';

// Export service functions
export { getCommentsByNode, createComment, getSingleComment, getCommentReplies } from './comment.service';

// Export public comment services
export {
    assignmentCommentService,
    learningMaterialCommentService,
    publicCommentService,
} from './publicComment.service';

// Export hooks
export { useGetCommentsByNode, useCreateComment, useGetSingleComment, useGetCommentReplies } from './comment.hooks';

// Export public comment hooks
export {
    useAssignmentComments,
    useCreateAssignmentComment,
    useLearningMaterialComments,
    useCreateLearningMaterialComment,
    useSubmissionComments,
    useCreateSubmissionComment,
    useCommentById,
    useUpdateComment,
    useDeleteComment,
} from './publicComment.hooks';
