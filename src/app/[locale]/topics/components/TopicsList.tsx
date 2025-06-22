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

interface Props {
    topics: ITopicsForUserReturned;
    setTopics: (topics: ITopicsForUserReturned) => void;
}

const TopicsList = ({ topics, setTopics }: Props) => {
    const router = useRouter();

    const [isTopicModalOpen, setIsTopicModalOpen] = useState<boolean>(false);
    const [topicEditedName, setTopicEditedName] = useState<string>('');
    const [topicEditedDescription, setTopicEditedDescription] = useState<string>('');

    function handleOnClickStudy(topicId: number) {
        router.push(`/flashcards/study?topicId=${topicId}`);
    }

    function handleOnClickEdit(name: string, description: string) {
        setTopicEditedName(name);
        setTopicEditedDescription(description);
    }

    function handleOnClickTitle(topicId: number) {
        router.push(`flashcards/edit?topicId=${topicId}`);
    }

    function handleClickMindmap(topicId: number) {
        router.push(`mindmap/${topicId}`);
    }

    async function handleOnClickDelete(topicId: number) {
        try {
            await deleteRequest(`/topics/${topicId}`);
            const topicsFiltered = topics!.filter((topic) => topic.topicId !== topicId);
            setTopics(topicsFiltered);
        } catch (err) {
            console.log(err);
        }
    }

    function getDescriptionFormatted(description: string) {
        let descriptionFormatted = description.slice(0, 50);
        if (description.length > 50) descriptionFormatted += '...';
        return descriptionFormatted;
    }

    // todo: check this function
    const setTopicsCallback = (topic: ITopicForUser) => {
        if (topics === null) return;
        const topicsUpdated = topics.map((e) => {
            if (e.topicId === topic.topicId) return { ...e, name: topic.name, description: topic.description };
            return e;
        });
        setTopics(topicsUpdated);
    };

    function renderDeleteTopicAlertingDialog(topicId: number, topicName: string) {
        const trigger = <Trash2 size={20} className="cursor-pointer" />;
        return (
            <DeleteAlertingModal
                trigger={trigger}
                title={`Delete topic ${topicName}`}
                description={'This action will delete all items related to this topic. Still delete?'}
                body={
                    <div className="flex justify-end">
                        <Button variant="destructive" onClick={() => handleClickDelete(topicId)}>
                            Delete
                        </Button>
                    </div>
                }
            />
        );
    }

    return (
        <div>
            <div className="grid grid-cols-12 gap-8 flex-col mt-7">
                {topics?.map((topic) => {
                    return (
                        <div className="col-span-3 bg-white rounded-lg p-4" key={topic.topicId}>
                            <div className="flex flex-row items-center justify-between">
                                <a
                                    className="text-xl font-medium cursor-pointer hover:text-blue-600 hover:underline"
                                    onClick={() => handleOnClickTitle(topic.topicId)}
                                >
                                    {topic.name}
                                </a>
                                <div className="flex flex-row gap-2">
                                    <Book
                                        size={20}
                                        className="cursor-pointer"
                                        onClick={() => handleOnClickStudy(topic.topicId)}
                                    />{' '}
                                    <Spline
                                  
                                        className="cursor-pointer"
                                        onClick={() => handleClickMindmap(topic.topicId)}
                                    />
                                    <TopicModal
                                        trigger={
                                            <SquarePen
                                                size={20}
                                                className="cursor-pointer"
                                                onClick={() => handleOnClickEdit(topic.name, topic.description)}
                                            />
                                        }
                                        title="Edit Topic"
                                        body={
                                            <TopicUpdatedForm
                                                topicId={topic.topicId}
                                                name={topicEditedName}
                                                description={topicEditedDescription}
                                                setName={setTopicEditedName}
                                                setDescription={setTopicEditedDescription}
                                                handleCloseModal={() => setIsTopicModalOpen(false)}
                                                setTopics={setTopicsCallback}
                                            />
                                        }
                                        isOpen={isTopicModalOpen}
                                        setIsOpen={setIsTopicModalOpen}
                                    />
                                    {renderDeleteTopicAlertingDialog(topic.topicId, topic.name)}
                                </div>
                            </div>
                            <div className="text-muted-foreground text-base h-[80px]">
                                {topic.description ? getDescriptionFormatted(topic.description) : 'No description'}
                            </div>
                            <div className="flex flex-row justify-between">
                                <div className="text-muted-foreground text-sm">Last review: 14/05/2025</div>
                                <div className="text-muted-foreground text-sm">{topic.flashcardsCount} Flashcards</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopicsList;
