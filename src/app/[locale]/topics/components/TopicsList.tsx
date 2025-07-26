'use client';

import { ITopic } from '../types/topic.type';
import { PersonalTopicCard } from './personal/PersonalTopicCard';
import { ClassTopicCard } from './class-based/ClassTopicCard';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';

type Props =
    | {
          type: MODE_ACCESS_PAGE_ROLE.personal;
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
          type: MODE_ACCESS_PAGE_ROLE.classBased;
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
                return type === MODE_ACCESS_PAGE_ROLE.personal ? (
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
