'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TopicWorkspaceProvider } from '@/app/[locale]/topics/[topicId]/(topic)/context/TopicWorkspaceContext';
import TopicWorkspace from '@/app/[locale]/topics/[topicId]/(topic)/components/workspace/TopicWorkspace';
import { MindMapProvider } from '@/app/[locale]/mindmap/context/MindMapContext';

export default function TopicPage() {
    const params = useParams();
    const isValidId =
        typeof params.topicId === 'string' && !isNaN(Number(params.topicId)) && Number(params.topicId) > 0;

    if (!isValidId) {
        return <div className="p-8">Invalid topicId, please try again.</div>;
    }
    const topicId = Number(params.topicId);

    return (
        <MindMapProvider>
            <TopicWorkspaceProvider topicIdInit={topicId}>
                <TopicWorkspace />
            </TopicWorkspaceProvider>
        </MindMapProvider>
    );
}
