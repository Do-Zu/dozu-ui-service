'use client';

import { ITopic } from '../types/topic.type';
import { PersonalTopicCard } from './personal/PersonalTopicCard';
import { ClassTopicCard } from './class-based/ClassTopicCard';

type Props =
    | {
          type: 'personal';
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
    | {
          type: 'class-based';
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
          editable: boolean;
      };

const TopicsList = (props: Props) => {
    const { type, topics, handleOpenUpdateModal, handleOpenDeleteModal } = props;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topics.map((topic) => {
                const { topicId } = topic;
                return type === 'personal' ? (
                    <PersonalTopicCard
                        key={topicId}
                        topic={topic}
                        handleOpenUpdateModal={handleOpenUpdateModal}
                        handleOpenDeleteModal={handleOpenDeleteModal}
                    />
                ) : (
                    <ClassTopicCard
                        key={topicId}
                        topic={topic}
                        handleOpenUpdateModal={handleOpenUpdateModal}
                        handleOpenDeleteModal={handleOpenDeleteModal}
                        editable={props.editable}
                    />
                );
            })}
        </div>
    );
};

export default TopicsList;
