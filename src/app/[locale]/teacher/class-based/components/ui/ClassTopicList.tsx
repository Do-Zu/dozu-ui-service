'use client';

import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import { ClassTopicCard } from './ClassTopicCard'; 
import React from 'react';

type Props = {
    topics: ITopic[];
    handleOpenUpdateModal: ({
        topicId,
        name,
        description,
    }: {
        topicId: number;
        name: string;
        description: string;
    }) => void;
    handleOpenDeleteModal: ({ topicId, name }: { topicId: number; name: string }) => void;
};

const ClassTopicList = React.memo((props: Props) => {
    const { topics, handleOpenUpdateModal, handleOpenDeleteModal } = props;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topics.map((topic) => {
                const { topicId } = topic;
                return (
                    <ClassTopicCard
                        key={topicId}
                        topic={topic}
                        handleOpenUpdateModal={handleOpenUpdateModal}
                        handleOpenDeleteModal={handleOpenDeleteModal}
                    />
                );
            })}
        </div>
    );
});

export default ClassTopicList;
