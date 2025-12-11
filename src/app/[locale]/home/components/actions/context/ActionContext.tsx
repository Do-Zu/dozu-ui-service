'use client';

import { createStore, useStore } from 'zustand';
import { createContext, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';

interface ActionState {
    showUpload: boolean;
    showLink: boolean;
    showRecord: boolean;
    isProcessing: boolean;
    setShowUpload: (show: boolean) => void;
    setShowLink: (show: boolean) => void;
    setShowRecord: (show: boolean) => void;
    setIsProcessing: (value: boolean) => void;
    redirectTopicWorkspace: (topicId: number) => void;
}

const createActionStore = (router: ReturnType<typeof useRouter>) =>
    createStore<ActionState>((set) => ({
        showUpload: false,
        showLink: false,
        showRecord: false,
        isProcessing: false,
        setIsProcessing: (val) => set({ isProcessing: val }),
        setShowUpload: (show) => set({ showUpload: show }),
        setShowLink: (show) => set({ showLink: show }),
        setShowRecord: (show) => set({ showRecord: show }),
        redirectTopicWorkspace: (topicId) => {
            router.push(
                ROUTES.TOPIC_WORKSPACE({
                    topicId,
                }),
            );
        },
    }));

type ActionStore = ReturnType<typeof createActionStore>;

const ActionContext = createContext<ActionStore | null>(null);

export const ActionProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const storeRef = useRef<ActionStore>();
    if (!storeRef.current) {
        storeRef.current = createActionStore(router);
    }
    return <ActionContext.Provider value={storeRef.current}>{children}</ActionContext.Provider>;
};

export const useActionStore = <T,>(selector: (state: ActionState) => T): T => {
    const store = useContext(ActionContext);
    if (!store) throw new Error('Missing ActionProvider');
    return useStore(store, selector);
};
