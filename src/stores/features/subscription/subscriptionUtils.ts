import { store } from '@/stores/registry.store';
import { openModal } from './subscriptionSlice';

/**
 * Utility function to open the upgrade modal from outside React components
 * This can be used in axios interceptors, utility functions, etc.
 */
export const openUpgradeModal = () => {
    store?.dispatch(openModal());
};

/**
 * Utility function to get the current subscription state from outside React components
 */
export const getSubscriptionState = () => {
    return store?.getState().subscription;
};
