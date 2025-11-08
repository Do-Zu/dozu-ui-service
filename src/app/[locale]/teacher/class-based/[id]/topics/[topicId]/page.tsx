'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { TopicWorkspaceProvider } from '@/app/[locale]/topics/[topicId]/(topic)/context/TopicWorkspaceContext';
import TeacherTopicWorkspace from './components/workspace/TeacherTopicWorkspace';

export default function TopicPage() {
    const params = useParams();
    const isValidId =
        typeof params.topicId === 'string' && !isNaN(Number(params.topicId)) && Number(params.topicId) > 0;

    if (!isValidId) {
        return <div className="p-8">Invalid topicId, please try again.</div>;
    }
    const topicId = Number(params.topicId);

    return (
        <TopicWorkspaceProvider>
            <TeacherTopicWorkspace topicId={topicId} />
        </TopicWorkspaceProvider>
    );
}
