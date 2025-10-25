import { useCallback, useState } from 'react';
import { ICreateTopicResponse, ITopic } from '../types/topic.type';
import usePost from '@/hooks/usePost';
import { ICreateTopicPayload } from '@/services/topic/topic.service';
import toastHelper from '@/utils/toast.helper';
import { useTranslations } from 'next-intl';
import { useValidateTopic } from './useTopics';

interface Props {
    setTopics: React.Dispatch<React.SetStateAction<ITopic[] | null>>;
    createFn: (payload: ICreateTopicPayload) => Promise<ICreateTopicResponse>;
}

export function useCreateTopic(props: Props) {
    const { setTopics, createFn } = props;
    const validateTopic = useValidateTopic();
    const tCommon = useTranslations('common');
    const tTopic = useTranslations('topic');
    const topicLabel = tTopic('topic');
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const open = useCallback(() => {
        setTimeout(() => {
            setIsOpen(true);
        }, 50);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const { loading, execute: createAsync } = usePost<ICreateTopicPayload, ICreateTopicResponse>(createFn, 'POST', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data: ICreateTopicResponse) => {
            toastHelper.showSuccessMessage(tCommon('messages.createSuccess', { name: topicLabel }));
            applyCreate(data);
            setIsOpen(false);
        },
    });

    async function submit(topic: ICreateTopicPayload) {
        if (validateTopic(topic)) {
            await createAsync(topic);
        }
    }

    const applyCreate = (topic: ICreateTopicResponse) => {
        setTopics((prevTopics) => {
            const currentTopics = prevTopics ?? [];
            return [
                ...currentTopics,
                { ...(topic as ITopic), flashcardCounts: { total: 0, new: 0, learning: 0, dueToday: 0 } },
            ];
        });
    };

    return { isOpen, setIsOpen, open, close, loading, submit, createAsync, applyCreate };
}
