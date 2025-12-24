'use client';

import React from 'react';
import PrivateCommentSection from '@/components/comments/PrivateCommentSection';
import { useSubmissionComments, useCreateSubmissionComment } from '@/services/class-based-learning/comment';
import { useTranslations } from 'next-intl';

interface TeacherPrivateCommentSectionProps {
    assignmentId: number;
    submissionId: number | null;
}

export default function TeacherPrivateCommentSection({ assignmentId, submissionId }: TeacherPrivateCommentSectionProps) {
    const t = useTranslations('assignment.comments');
    const page = 1;
    const limit = 20;

    const { comments, loading, error, refetch } = useSubmissionComments(
        assignmentId,
        submissionId || undefined,
        page,
        limit
    );
    const { createComment, loading: creating } = useCreateSubmissionComment(assignmentId, submissionId || undefined);

    if (!submissionId) {
        return null;
    }

    return (
        <PrivateCommentSection
            comments={comments}
            loading={loading}
            error={error}
            refetch={refetch}
            createComment={createComment}
            creating={creating}
            canComment={submissionId !== null}
            placeholder={t('addPrivateCommentForStudent')}
            submitButtonText={t('send')}
        />
    );
}

