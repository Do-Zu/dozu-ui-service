import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';
import { useCreateFeed } from './useCreateFeed';
import classFeedService from '@/services/class-based-learning/classFeed.service';
import useFetch from '@/hooks/useFetch';
import { useUpdateFeed } from './useUpdateFeed';
import { useDeleteFeed } from './useDeleteFeed';
import { useTranslations } from 'next-intl';
import { TimeUnit } from '@/utils';

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

export function useGroupLabel() {
    const tFeed = useTranslations('class.classFeed');

    return (unit: string) => {
        switch (unit) {
            case TimeUnit.MINUTE:
                return tFeed('aFewMinutesAgo');
            case TimeUnit.DAY:
                return tFeed('today');
            case TimeUnit.WEEK:
                return tFeed('thisWeek');
            case TimeUnit.MONTH:
                return tFeed('thisMonth');
            default:
                return tFeed('aLongTimeAgo');
        }
    };
}
