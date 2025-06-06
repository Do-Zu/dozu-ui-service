'use client';

import useFetch from '@/hooks/useFetch';
import { Book, SquarePen, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { deleteRequest } from '@/api/api';
import { DeleteAlertingModal } from './DeleteAlertingDialog';
import { ITopicsForUserReturned } from '../topic.type';

const TopicsList = () => {
  const router = useRouter();

  const {
    data: topics,
    setData: setTopics,
    error: topicsError,
    loading: topicsLoading,
  } = useFetch<ITopicsForUserReturned>('/topics');

  if (topicsLoading || !topics) {
    return <div>Loading...</div>;
  }

  if (topicsError) {
    return <div>Error: {topicsError} </div>;
  }

  if (topics?.length === 0) {
    return <div>No Topics available</div>;
  }

  function handleClickStudy(topicId: number) {
    router.push(`/flashcards/study?topicId=${topicId}`);
  }

  function handleClickEdit(topicId: number) {
    router.push(`/topics/${topicId}`);
  }

  function handleClickTitle(topicId: number) {
    router.push(`flashcards/edit?topicId=${topicId}`)
  }

  async function handleClickDelete(topicId: number) {
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

  function renderDeleteTopicAlertingDialog(topicId: number, topicName: string) {
    const trigger = 
      <Trash2
        size={20}
        className="cursor-pointer"
      />
    return (
      <DeleteAlertingModal 
        trigger={trigger}
        title={`Delete topic ${topicName}`}
        description={'This action will delete all items related to this topic. Still delete?'}
        body={
          <div className="flex justify-end">
            <Button variant='destructive' onClick={() => handleClickDelete(topicId)}>Delete</Button>
          </div>
        }
      />
    )
  }

  return (
    <div>
      <div className="grid grid-cols-12 gap-8 flex-col mt-7">
        {topics?.map((topic) => {
          return (
            <div className="col-span-3 bg-white rounded-lg p-4" key={topic.topicId}>
              <div className="flex flex-row items-center justify-between">
                <a className="text-xl font-medium cursor-pointer hover:text-blue-600 hover:underline" onClick={() => handleClickTitle(topic.topicId)}>
                  {topic.name}
                </a>
                <div className="flex flex-row gap-2">
                  <Book
                    size={20}
                    className="cursor-pointer"
                    onClick={() => handleClickStudy(topic.topicId)}
                  />
                  <SquarePen
                    size={20}
                    className="cursor-pointer"
                    onClick={() => handleClickEdit(topic.topicId)}
                  />
                  {renderDeleteTopicAlertingDialog(topic.topicId, topic.name)}
                </div>
              </div>
              <div className="text-muted-foreground text-base h-[80px]">
                {topic.description ? getDescriptionFormatted(topic.description) : 'No description'}
              </div>
              <div className="flex flex-row justify-between">
                <div className="text-muted-foreground text-sm">Last review: 14/05/2025</div>
                <div className="text-muted-foreground text-sm">
                  {topic.flashcardsCount} Flashcards
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicsList;
