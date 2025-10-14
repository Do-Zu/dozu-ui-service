import topicService, { IUpdateTopicPayload } from '@/services/topic/topic.service';
import { ITopic, IUpdateTopicResponse } from '../types/topic.type';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { IUpdatingTopic } from '../components/modals/UpdateTopicModal';
import { useValidateTopic } from './useTopics';

interface Props {
    setTopics: React.Dispatch<React.SetStateAction<ITopic[] | null>>;
    updateFn: (payload: IUpdateTopicPayload) => Promise<IUpdateTopicResponse>;
}

export function useUpdateTopic({ setTopics, updateFn }: Props) {
    const validateTopic = useValidateTopic();
    const tCommon = useTranslations('common');
    const tTopic = useTranslations('topic');
    const topicLabel = tTopic('topic');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [updatingTopic, setUpdatingTopic] = useState<IUpdatingTopic | null>();

    useEffect(() => {
        if (!isOpen) {
            setUpdatingTopic(null);
        }
    }, [isOpen]);

    const open = useCallback((topic: IUpdatingTopic) => {
        setUpdatingTopic(topic);
        setTimeout(() => {
            setIsOpen(true);
        }, 50);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const { loading, execute: updateAsync } = usePost<IUpdateTopicPayload, IUpdateTopicResponse>(updateFn, 'PUT', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data) => {
            toastHelper.showSuccessMessage(tCommon('messages.updateSuccess', { name: topicLabel }));
            applyUpdate(data);
            setIsOpen(false);
        },
    });

    async function submit(topic: IUpdateTopicPayload) {
        if (validateTopic(topic)) {
            await updateAsync(topic);
        }
    }

    const applyUpdate = (topic: IUpdateTopicResponse) => {
        setTopics((prevTopics) => {
            const currentTopics = prevTopics ?? [];
            const topicsUpdated = currentTopics.map((e) => {
                if (e.topicId === topic.topicId)
                    return {
                        ...e,
                        name: topic.name,
                        description: topic.description,
                        imageUrl: topic.imageUrl,
                    };
                return e;
            });
            return topicsUpdated;
        });
    };

    return { isOpen, setIsOpen, open, close, loading, submit, updateAsync, applyUpdate, updatingTopic };
}
