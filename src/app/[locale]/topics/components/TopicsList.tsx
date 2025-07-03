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
import { toast } from '@/hooks/use-toast';

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

    const updatedFormT = useTranslations('topic.updatedForm');
    const deletedFormT = useTranslations('topic.deletedForm');

    const [isTopicUpdatedModalOpen, setIsTopicUpdatedModalOpen] = useState<boolean>(false);
    const [isTopicDeletedModalOpen, setIsTopicDeletedModalOpen] = useState<boolean>(false);

    const [topicEditedId, setTopicEditedId] = useState<number>(0);
    const [topicEditedName, setTopicEditedName] = useState<string>('');
    const [topicEditedDescription, setTopicEditedDescription] = useState<string>('');

    const [topicDeletedId, setTopicDeletedId] = useState<number>(0);
    const [topicDeletedName, setTopicDeletedName] = useState<string>('');

    function handleClickMindmap(topicId: number) {
        router.push(`mindmap/${topicId}`);
    }

    async function handleOnClickDelete(topicId: number) {
        try {
            await deleteRequest(`/topics/${topicId}`);
            deleteTopic(topicId);
            setIsTopicDeletedModalOpen(false);
            toast({
                title: 'Delete Topic successfully!',
                variant: 'default'
            })
        } catch (err) {
            toast({
                title: 'Delete Topic failed, please try again',
                variant: 'default'
            })
        }
    }

    // update topics state (UI) 
    const updateTopics = (topic: ITopicForUser) => {
        if (topics === null) return;
        const topicsUpdated = topics.map((e) => {
            if (e.topicId === topic.topicId) return { ...e, name: topic.name, description: topic.description };
            return e;
        });
        setTopics(topicsUpdated);
    };

    // update topics state (UI)
    const deleteTopic = (topicId: number) => {
        const topicsFiltered = topics!.filter((topic) => topic.topicId !== topicId);
        setTopics(topicsFiltered);
    }

    const onSelectEditTopic = ({ topicId, name, description } : { topicId: number, name: string, description: string }) => {
        setTopicEditedId(topicId);
        setTopicEditedName(name);
        setTopicEditedDescription(description);

        setTimeout(() => {
            setIsTopicUpdatedModalOpen(true);
        }, 50);
    };

    const onSelectDeleteTopic = ({ topicId, name } : { topicId: number, name: string }) => {
        setTopicDeletedId(topicId);
        setTopicDeletedName(name);

        setTimeout(() => {
            setIsTopicDeletedModalOpen(true);
        }, 50);
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topics.map((topic) => {
                return (
                    <TopicCard
                        key={topic.topicId}
                        topic={topic}
                        onSelectEditTopic={onSelectEditTopic}
                        onSelectDeleteTopic={onSelectDeleteTopic}
                    />
                );
            })}

            <TopicModal
                title={updatedFormT('title')}
                body={
                    <TopicUpdatedForm
                        topicId={topicEditedId}
                        name={topicEditedName}
                        description={topicEditedDescription}
                        setName={setTopicEditedName}
                        setDescription={setTopicEditedDescription}
                        handleCloseModal={() => setIsTopicUpdatedModalOpen(false)}
                        updateTopics={updateTopics}
                    />
                }
                isOpen={isTopicUpdatedModalOpen}
                setIsOpen={setIsTopicUpdatedModalOpen}
            />

            <DeleteAlertingModal
                title={deletedFormT('title', { name: topicDeletedName })}
                description={deletedFormT('description')}
                body={
                    <div className="flex justify-end">
                        <Button variant="destructive" onClick={() => handleOnClickDelete(topicDeletedId)}>
                            {deletedFormT('deleteButton')}
                        </Button>
                    </div>
                }
                isOpen={isTopicDeletedModalOpen}
                setIsOpen={setIsTopicDeletedModalOpen}
            />
        </div>
    );
};

export default TopicsList;
