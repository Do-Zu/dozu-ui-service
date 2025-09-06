import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';
import usePost from '@/hooks/usePost';
import classFeedService, {
    ICreateClassFeedBody,
    ICreateClassFeedPayload,
} from '@/services/class-based-learning/classFeed.service';
import toastHelper from '@/utils/toast.helper';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

interface Props {
    classId: number;
    setFeeds: React.Dispatch<React.SetStateAction<IClassFeed[] | null>>;
}

export function useCreateFeed({ classId, setFeeds }: Props) {
    const tCommon = useTranslations('common');
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const open = useCallback(() => {
        setTimeout(() => {
            setIsOpen(true);
        }, 50);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const { loading, execute: createAsync } = usePost<ICreateClassFeedPayload, IClassFeed>(
        classFeedService.createGeneralFeed,
        'POST',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess(data) {
                toastHelper.showSuccessMessage('Create class feed successfully');
                applyCreate(data);
                setIsOpen(false);
            },
        },
    );

    async function submit(feed: ICreateClassFeedBody) {
        if (!feed.title) {
            toastHelper.showErrorMessage(tCommon('validation.required', { name: tCommon('labels.title') }));
            return;
        }
        if (feed.link === undefined || feed.link?.length === 0) {
            feed.link = null;
        }
        const value: ICreateClassFeedPayload = { ...feed, classId };
        await createAsync(value);
    }

    const applyCreate = (feed: IClassFeed) => {
        setFeeds((prevFeeds) => {
            const currentFeeds = prevFeeds ?? [];
            const result = [...currentFeeds];
            result.unshift(feed);
            return result;
        });
    };

    return { isOpen, setIsOpen, open, close, loading, submit, createAsync, applyCreate };
}
