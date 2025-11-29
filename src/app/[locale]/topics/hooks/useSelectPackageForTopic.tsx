import { useCallback, useEffect, useState } from 'react';
import { ITopic } from '../types/topic.type';

export function useSelectPackageForTopic() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectingTopic, setSelectingTopic] = useState<ITopic | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectingTopic(null);
        }
    }, [isOpen]);

    const open = useCallback((topic: ITopic) => {
        setSelectingTopic(topic);
        setTimeout(() => {
            setIsOpen(true);
        }, 50);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    return { isOpen, setIsOpen, open, close, selectingTopic };
}
