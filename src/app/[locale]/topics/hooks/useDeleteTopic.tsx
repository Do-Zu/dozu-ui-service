import { useTranslations } from 'next-intl';
import { ITopic } from '../types/topic.type';
import { useCallback, useEffect, useState } from 'react';
import { IDeletingTopic } from '../components/modals/DeleteTopicModal';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';

interface Props {
    setTopics: React.Dispatch<React.SetStateAction<ITopic[] | null>>;
    deleteFn: (payload: number) => Promise<number>;
}

export function useDeleteTopic({ setTopics, deleteFn }: Props) {
    const tCommon = useTranslations('common');
    const tTopic = useTranslations('topic');
    const topicLabel = tTopic('topic');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [deletingTopic, setDeletingTopic] = useState<IDeletingTopic | null>();

    useEffect(() => {
        if (!isOpen) {
            setDeletingTopic(null);
        }
    }, [isOpen]);

    const open = useCallback((topic: IDeletingTopic) => {
        setDeletingTopic(topic);
        setTimeout(() => {
            setIsOpen(true);
        }, 50);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const { loading, execute: deleteAsync } = usePost<number, number>(deleteFn, 'DELETE', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data) => {
            toastHelper.showSuccessMessage(tCommon('messages.deleteSuccess', { name: topicLabel }));
            applyDelete(data);
            setIsOpen(false);
        },
    });

    async function submit(topicId: number) {
        await deleteAsync(topicId);
    }

    const applyDelete = (topicId: number) => {
        setTopics((prevTopics) => {
            const currentTopics = prevTopics ?? [];
            const topicsFiltered = currentTopics.filter((topic) => topic.topicId !== topicId);
            return topicsFiltered;
        });
    };

    return { isOpen, setIsOpen, open, close, loading, submit, deleteAsync, applyDelete, deletingTopic };
}
