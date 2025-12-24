'use client';

import React from 'react';
import PublicCommentSection from '@/components/comments/PublicCommentSection';
import {
    useAssignmentComments,
    useCreateAssignmentComment,
} from '@/services/class-based-learning/comment';
import CommentInput from './CommentInput';

interface CommentSectionProps {
    classId: number;
    assignmentId: number;
}

export default function CommentSection({ classId, assignmentId }: CommentSectionProps) {
    const page = 1;
    const limit = 20;

    const { comments, loading, error, refetch } = useAssignmentComments(classId, assignmentId, page, limit);
    const { createComment, loading: creating } = useCreateAssignmentComment(classId, assignmentId);

    return (
        <PublicCommentSection
            comments={comments}
            loading={loading}
            error={error}
            refetch={refetch}
            createComment={createComment}
            creating={creating}
            commentInputComponent={CommentInput}
        />
    );
}

