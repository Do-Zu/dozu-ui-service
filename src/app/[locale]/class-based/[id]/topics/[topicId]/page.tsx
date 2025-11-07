'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import StudentTopicWorkspace from '@/app/[locale]/topics/[topicId]/(topic)/components/workspace/StudentTopicWorkspace';
import { PersonalTopicWorkspaceProvider } from '@/app/[locale]/topics/[topicId]/(topic)/context/PersonalTopicWorkspaceContext';

export default function TopicPage() {
    const params = useParams();
    const isValidId =
        typeof params.topicId === 'string' && !isNaN(Number(params.topicId)) && Number(params.topicId) > 0;

    if (!isValidId) {
        return <div className="p-8">Invalid topicId, please try again.</div>;
    }
    const topicId = Number(params.topicId);

    return (
        <PersonalTopicWorkspaceProvider>
            <StudentTopicWorkspace topicId={topicId} />
        </PersonalTopicWorkspaceProvider>
    );
}
