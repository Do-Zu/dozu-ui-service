import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import {
    fetchPlans,
    openModal,
    closeModal,
    setSelectedPlan,
    selectSubscriptionState,
} from '@/stores/features/subscription/subscriptionSlice';
import { PlanFeature } from '@/components/upgrade-plan/UpgradePlanModal';

export function useUpgradePlanModal() {
    const dispatch = useAppDispatch();
    const {
        isModalOpen: isOpen,
        error,
        loading,
        freePlan,
        monthlyPlan,
        plans,
        proPlans,
        selectedPlan,
        yearlyPlan,
    } = useAppSelector((state) => state.subscription);

    // Fetch plans when modal opens
    useEffect(() => {
        if (isOpen && plans.length === 0 && !loading) {
            dispatch(fetchPlans());
        }
    }, [isOpen, plans.length, loading, dispatch]);

    const handleSelectPlan = () => {
        const selectedPlanData = plans.find((plan) => plan.planId === selectedPlan);
        console.log('Selected plan:', selectedPlanData);
        // Handle plan selection logic here
        // You can dispatch additional actions or call APIs here
    };

    const onClose = () => {
        dispatch(closeModal());
    };

    const openModalHandler = () => {
        dispatch(openModal());
    };

    const handleSetSelectedPlan = (planId: number | null) => {
        dispatch(setSelectedPlan(planId));
    };

    const formatFeatureValue = (feature: PlanFeature): string => {
        if (feature.isUnlimited) {
            return 'Unlimited';
        }

        if (feature.numericValue) {
            const value = parseFloat(feature.numericValue);
            switch (feature.name) {
                case 'Topics Creation':
                    return `${value} topics`;
                case 'Credit Generate':
                    return `${value} credits/day`;
                case 'Storage':
                    return `${value} GB storage`;
                case 'Max File Size':
                    return `${value} MB max file size`;
                default:
                    return feature.numericValue;
            }
        }

        return feature.textValue || 'Enabled';
    };

    const calculateSavings = (monthlyPrice: number, yearlyPrice: number): number => {
        const monthlyTotal = monthlyPrice * 12;
        const savings = ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;
        return Math.round(savings);
    };

    const formatPrice = (price: string, currency: string): string => {
        const symbol = currency === 'USD' ? '$' : currency;
        return `${symbol}${price}`;
    };

    const getSelectedPlanName = (): string => {
        const selected = plans.find((plan) => plan.planId === selectedPlan);
        return selected?.name || 'Select a plan';
    };

    return {
        isOpen,
        openModal: openModalHandler,
        onClose,
        selectedPlan,
        handleSelectPlan,
        formatFeatureValue,
        calculateSavings,
        formatPrice,
        getSelectedPlanName,
        setSelectedPlan: handleSetSelectedPlan,
        loading,
        error,
        plans,
        yearlyPlan,
        monthlyPlan,
        freePlan,
        proPlans,
    };
}
