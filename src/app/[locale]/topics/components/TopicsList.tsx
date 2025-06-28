'use client';

import useFetch from '@/hooks/useFetch';
import { Book, Spline, SquarePen, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { deleteRequest } from '@/api/api';
import { DeleteAlertingModal } from './DeleteAlertingDialog';
import { ITopicForUser, ITopicsForUserReturned } from '../topic.type';
import { TopicModal } from './TopicModal';
import { useState } from 'react';
import { TopicUpdatedForm } from './TopicUpdatedForm';
import { useTranslations } from 'next-intl';
import { TopicCard } from './TopicCard';

function getDescriptionFormatted(description: string) {
    let descriptionFormatted = description.slice(0, 50);
    if (description.length > 50) descriptionFormatted += '...';
    return descriptionFormatted;
}

interface Props {
    topics: ITopicsForUserReturned;
    setTopics: (topics: ITopicsForUserReturned) => void;
}

const TopicsList = ({ topics, setTopics }: Props) => {
    const router = useRouter();
    
    const [isTopicUpdatedModalOpen, setIsTopicUpdatedModalOpen] = useState<boolean>(false);
    const [isTopicDeletedModalOpen, setIsTopicDeletedModalOpen] = useState<boolean>(false);

    function handleClickMindmap(topicId: number) {
        router.push(`mindmap/${topicId}`);
    }

    async function handleOnClickDelete(topicId: number) {
        try {
            await deleteRequest(`/topics/${topicId}`);
            const topicsFiltered = topics!.filter((topic) => topic.topicId !== topicId);
            setTopics(topicsFiltered);
            setIsTopicDeletedModalOpen(false);
        } catch (err) {
            console.log(err);
        }
    }

    // todo: check this function
    const updateTopics = (topic: ITopicForUser) => {
        if (topics === null) return;
        const topicsUpdated = topics.map((e) => {
            if (e.topicId === topic.topicId) return { ...e, name: topic.name, description: topic.description };
            return e;
        });
        setTopics(topicsUpdated);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topics.map(topic => {
                return (
                    <TopicCard 
                        key={topic.topicId}
                        topic={topic}
                        updateTopics={updateTopics}
                        handleOnClickDelete={handleOnClickDelete}
                        isTopicUpdatedModalOpen={isTopicUpdatedModalOpen}
                        setIsTopicUpdatedModalOpen={setIsTopicUpdatedModalOpen}
                        isTopicDeletedModalOpen={isTopicDeletedModalOpen}
                        setIsTopicDeletedModalOpen={setIsTopicDeletedModalOpen}
                    />
                )
                // return <ContentCard />
            })}
        </div>
    );
};

export default TopicsList;
