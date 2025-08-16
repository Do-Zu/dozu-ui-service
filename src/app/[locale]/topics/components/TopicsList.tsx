'use client';

import { ITopic } from '../types/topic.type';
import { PersonalTopicCard } from './personal/PersonalTopicCard';
import { ClassTopicCard } from './class-based/ClassTopicCard';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import React from 'react';

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
      };

const TopicsList = React.memo(
    (props: Props) => {
        const { type, topics } = props;
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {topics.map((topic) => {
                    const { topicId } = topic;
                    return type === MODE_ACCESS_PAGE_ROLE.personal ? (
                        <PersonalTopicCard
                            key={topicId}
                            topic={topic}
                            handleOpenUpdateModal={props.handleOpenUpdateModal}
                            handleOpenDeleteModal={props.handleOpenDeleteModal}
                        />
                    ) : (
                        <ClassTopicCard
                            key={topicId}
                            topic={topic}
                        />
                    );
                })}
            </div>
        );
    },
    // (prevProps, nextProps) => {
    //     const isEqual = shallowCompareProps(prevProps, nextProps);
    //     if (!isEqual) {
    //         console.log('Re-render TopicsList because props changed:');
    //         comparePropsDiff(prevProps, nextProps);
    //     }
    //     return isEqual;
    // },
);

export default TopicsList;
