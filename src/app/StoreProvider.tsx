'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { AppStore, makeStore } from '@/stores/store';
import { setStore } from '@/stores/registry.store';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore | null>(null);

    if (!storeRef.current) {
        storeRef.current = makeStore();
        setStore(storeRef.current);
    }

    return <Provider store={storeRef.current}>{children}</Provider>;
}
