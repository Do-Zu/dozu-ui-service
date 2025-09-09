import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';
import usePost from '@/hooks/usePost';
import classFeedService, { IDeleteClassFeedPayload } from '@/services/class-based-learning/classFeed.service';
import toastHelper from '@/utils/toast.helper';
import { useCallback, useState } from 'react';

interface Props {
    classId: number;
    setFeeds: React.Dispatch<React.SetStateAction<IClassFeed[] | null>>;
}

export function useDeleteFeed({ classId, setFeeds }: Props) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [deletingFeed, setDeletingFeed] = useState<number | null>(null);

    const open = useCallback((feed: number) => {
        setDeletingFeed(feed);
        setTimeout(() => {
            setIsOpen(true);
        }, 50);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const { loading, execute: deleteAsync } = usePost<IDeleteClassFeedPayload, number>(
        classFeedService.deleteFeed,
        'DELETE',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess(data) {
                toastHelper.showSuccessMessage('Delete class feed successfully');
                applyDelete(data);
                setIsOpen(false);
            },
        },
    );

    async function submit(classFeedId: number) {
        const value: IDeleteClassFeedPayload = { classId, classFeedId };
        await deleteAsync(value);
    }

    const applyDelete = (classFeedId: number) => {
        setFeeds((prevFeeds) => {
            const currentFeeds = prevFeeds ?? [];
            const feedsFiltered = currentFeeds.filter((e) => e.classFeedId !== classFeedId);
            return feedsFiltered;
        });
    };

    return { isOpen, setIsOpen, open, close, loading, submit, deleteAsync, applyDelete, deletingFeed };
}
