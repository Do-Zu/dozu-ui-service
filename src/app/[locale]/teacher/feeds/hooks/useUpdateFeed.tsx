import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';
import usePost from '@/hooks/usePost';
import classFeedService, { IUpdateClassFeedPayload } from '@/services/class-based-learning/classFeed.service';
import toastHelper from '@/utils/toast.helper';
import { useCallback, useState } from 'react';
import { IUpdatingFeed } from '../components/modals/UpdateFeedModal';
import { useTranslations } from 'next-intl';

interface Props {
    classId: number;
    setFeeds: React.Dispatch<React.SetStateAction<IClassFeed[] | null>>;
}

export function useUpdateFeed({ classId, setFeeds }: Props) {
    const tCommon = useTranslations('common');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [updatingFeed, setUpdatingFeed] = useState<IUpdatingFeed | null>(null);

    const open = useCallback((feed: IUpdatingFeed) => {
        setUpdatingFeed(feed);
        setTimeout(() => {
            setIsOpen(true);
        }, 50);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const { loading, execute: updateAsync } = usePost<IUpdateClassFeedPayload, IClassFeed>(
        classFeedService.updateFeed,
        'PUT',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess(data) {
                toastHelper.showSuccessMessage('Update class feed successfully');
                applyUpdate(data);
                setIsOpen(false);
            },
        },
    );

    async function submit(feed: IUpdatingFeed) {
        if (!updatingFeed) {
            toastHelper.showErrorMessage('No selecting feed');
            return;
        }
        if (!feed.title) {
            toastHelper.showErrorMessage(tCommon('validation.required', { name: tCommon('labels.title') }));
            return;
        }
        const value: IUpdateClassFeedPayload = { ...feed, classId };
        await updateAsync(value);
    }

    const applyUpdate = (feed: IClassFeed) => {
        setFeeds((prevFeeds) => {
            const currentFeeds = prevFeeds ?? [];
            const feedsUpdated = currentFeeds.map((e) => {
                return e.classFeedId === feed.classFeedId ? feed : e;
            });
            return feedsUpdated;
        });
    };

    return { isOpen, setIsOpen, open, close, loading, submit, updateAsync, applyUpdate, updatingFeed };
}
