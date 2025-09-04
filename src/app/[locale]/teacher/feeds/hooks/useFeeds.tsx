import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';
import { useCreateFeed } from './useCreateFeed';
import classFeedService from '@/services/class-based-learning/classFeed.service';
import useFetch from '@/hooks/useFetch';
import { useUpdateFeed } from './useUpdateFeed';
import { useDeleteFeed } from './useDeleteFeed';

interface Props {
    classId: number;
}

export function useFeeds({ classId }: Props) {
    const {
        data: feeds,
        setData: setFeeds,
        error: feedsError,
        loading: feedsLoading,
    } = useFetch<IClassFeed[]>(() => classFeedService.getFeedsInClassForTeacher({ classId }));

    const createFeed = useCreateFeed({ classId, setFeeds });
    const updateFeed = useUpdateFeed({ classId, setFeeds });
    const deleteFeed = useDeleteFeed({ classId, setFeeds });

    return {
        fetchFeeds: { feeds, setFeeds, feedsError, feedsLoading },
        createFeed,
        updateFeed,
        deleteFeed,
    };
}
