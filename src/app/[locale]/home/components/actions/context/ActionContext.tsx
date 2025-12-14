'use client';

import { createContext, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createStore, useStore } from 'zustand';
import { ROUTES } from '@/utils/constants/routes';
import { TypeImportMethod } from '../constants/resource';
import { isNilOrEmpty } from '@/utils';

interface ActionState {
    showUpload: boolean;
    showLink: boolean;
    showMedia: boolean;
    processingType: TypeImportMethod | null;
    setShowUpload: (show: boolean) => void;
    setShowLink: (show: boolean) => void;
    setShowMedia: (show: boolean) => void;
    setProcessingType: (type: TypeImportMethod | null) => void;
    isProcessing: (type?: TypeImportMethod) => boolean;
    redirectTopicWorkspace: (topicId: number) => void;
}

const createActionStore = (router: ReturnType<typeof useRouter>) => {
    return createStore<ActionState>((set, get) => ({
        showUpload: false,
        showLink: false,
        showMedia: false,
        processingType: null,
        setProcessingType: (type) => set({ processingType: type }),
        setShowUpload: (show) => set({ showUpload: show }),
        setShowLink: (show) => set({ showLink: show }),
        setShowMedia: (show) => set({ showMedia: show }),
        isProcessing: (type) => {
            const { processingType } = get();

            if (type) {
                return processingType === type;
            }

            return !isNilOrEmpty(processingType);
        },
        redirectTopicWorkspace: (topicId) => {
            router.push(
                ROUTES.TOPIC_WORKSPACE({
                    topicId,
                }),
            );
        },
    }));
};

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
