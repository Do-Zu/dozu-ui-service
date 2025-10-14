import { useCallback, useEffect, useState } from 'react';
import { ITopicDetails } from '../components/modals/TopicDetailsModal';
import { ITopic } from '../types/topic.type';

export function useTopicDetails() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectingTopic, setSelectingTopic] = useState<ITopicDetails | null>();

    useEffect(() => {
        if (!isOpen) {
            setSelectingTopic(null);
        }
    }, [isOpen]);

    const open = (topic: ITopic) => {
        const selectingTopic: ITopicDetails = {
            ...topic,
        };
        setSelectingTopic(selectingTopic);
        setTimeout(() => {
            setIsOpen(true);
        }, 50);
    };

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    return { isOpen, setIsOpen, open, close, selectingTopic };
}
