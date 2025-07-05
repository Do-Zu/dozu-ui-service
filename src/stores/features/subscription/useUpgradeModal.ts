import { useAppDispatch } from '@/stores/hooks';
import { openModal } from '@/stores/features/subscription/subscriptionSlice';

/**
 * Trigger the upgrade plan modal from anywhere in the app
 *
 */
export function useUpgradeModal() {
    const dispatch = useAppDispatch();

    const openUpgradeModal = () => {
        dispatch(openModal());
    };

    return { openUpgradeModal };
}
