'use client';

import { TopicCard } from './TopicCard';
import { ITopic } from '../topic.type';

interface Props {
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
}

const TopicsList = ({ topics, handleOpenUpdateModal, handleOpenDeleteModal }: Props) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topics.map((topic) => {
                return (
                    <TopicCard
                        key={topic.topicId}
                        topic={topic}
                        handleOpenUpdateModal={handleOpenUpdateModal}
                        handleOpenDeleteModal={handleOpenDeleteModal}
                    />
                );
            })}
        </div>
    );
};

export default TopicsList;
