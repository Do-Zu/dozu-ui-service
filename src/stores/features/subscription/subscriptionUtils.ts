import { getStore } from '@/stores/registry.store';
import { openModal } from './subscriptionSlice';

/**
 * Utility function to open the upgrade modal from outside React components
 * This can be used in axios interceptors, utility functions, etc.
 */
export const openUpgradeModal = () => {
    const store = getStore();

    if (!store) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Store not initialized - cannot retrieve subscription state');
        }
        return;
    }

    store.dispatch(openModal());
};

/**
 * Utility function to get the current subscription state from outside React components
 */
export const getSubscriptionState = () => {
    const store = getStore();

    if (!store) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Store not initialized - cannot retrieve subscription state');
        }
        return;
    }

    return store.getState().subscription;
};
