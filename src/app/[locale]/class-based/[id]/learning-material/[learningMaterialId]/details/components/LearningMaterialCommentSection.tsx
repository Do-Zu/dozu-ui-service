'use client';

import React from 'react';
import PublicCommentSection from '@/components/comments/PublicCommentSection';
import {
    useLearningMaterialComments,
    useCreateLearningMaterialComment,
} from '@/services/class-based-learning/comment';
import CommentInput from '@/app/[locale]/teacher/class-based/[id]/assignments/[assignmentId]/details/components/CommentInput';

interface LearningMaterialCommentSectionProps {
    classId: number;
    learningMaterialId: number;
}

export default function LearningMaterialCommentSection({ classId, learningMaterialId }: LearningMaterialCommentSectionProps) {
    const page = 1;
    const limit = 20;

    const { comments, loading, error, refetch } = useLearningMaterialComments(classId, learningMaterialId, page, limit);
    const { createComment, loading: creating } = useCreateLearningMaterialComment(classId, learningMaterialId);

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

