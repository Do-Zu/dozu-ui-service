import { useEffect } from 'react';

import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import { isEmpty } from '@/utils';
import useFetch from '@/hooks/useFetch';
import TopicOverview from '../overview/TopicOverview';
import topicService from '@/services/topic/topic.service';
import DataStatus from '@/components/errors/DataStatus';
import LoadingPage from '@/app/loading';

export default function OverViewTab() {
    const { topic, topicId, setTopic } = useTopicWorkspace();

    const {
        data: topicContent,
        loading: topicContentLoading,
        error: topicContentError,
    } = useFetch<ITopic>(() => topicService.getTopicById(topicId));

    useEffect(() => {
        setTopic(topicContent);
    }, [topicContent]);

    if (topicContentLoading) return <LoadingPage />;

    if (topicContentError) return <DataStatus variant="error" title={topicContentError} />;

    if (isEmpty(topic)) return <DataStatus variant="empty" />;

    return <TopicOverview mode={MODE_ACCESS_PAGE_ROLE.personal} />;
}
