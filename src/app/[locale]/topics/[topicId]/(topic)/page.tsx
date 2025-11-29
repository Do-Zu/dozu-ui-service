'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import TopicWorkspace from './components/workspace/TopicWorkspace';
import { TopicWorkspaceProvider } from './context/TopicWorkspaceContext';
import { withAuth } from '@/hoc/withAuth';

const TopicPage = () => {
    const params = useParams();

    const isValidId =
        typeof params.topicId === 'string' && !isNaN(Number(params.topicId)) && Number(params.topicId) > 0;

    if (!isValidId) {
        return <div className="p-8">Invalid topicId, please try again.</div>;
    }

    const topicId = Number(params.topicId);

    return (
        <TopicWorkspaceProvider topicIdInit={topicId}>
            <TopicWorkspace />
        </TopicWorkspaceProvider>
    );
};

export default withAuth(TopicPage);
