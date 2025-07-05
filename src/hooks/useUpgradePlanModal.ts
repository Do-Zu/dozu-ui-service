'use client';

import { Plan, PlanFeature } from '@/components/upgrade-plan/UpgradePlanModal';
import { useEffect, useState } from 'react';
import useFetch from './useFetch';

export function useUpgradePlanModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
    const { loading, error, data } = useFetch<unknown, Plan[]>('/subscription/plans', {
        shouldRun: isOpen,
    });

    const plans: Plan[] = data || [];
    const proPlans = plans.filter((plan) => plan.planType === 'pro');
    const monthlyPlan = proPlans.find((plan) => plan.billingInterval === 'monthly');
    const yearlyPlan = proPlans.find((plan) => plan.billingInterval === 'yearly');
    const freePlan = proPlans.find((plan) => plan.planType === 'free');

    // Set default selected plan to yearly if available
    useEffect(() => {
        if (yearlyPlan && selectedPlan === null) {
            setSelectedPlan(yearlyPlan.planId);
        } else if (monthlyPlan && selectedPlan === null) {
            setSelectedPlan(monthlyPlan.planId);
        }
    }, [yearlyPlan, monthlyPlan, selectedPlan]);

    const handleSelectPlan = () => {
        const selectedPlanData = plans.find((plan) => plan.planId === selectedPlan);
        console.log('Selected plan:', selectedPlanData);
        // Handle plan selection logic here
    };

    const onClose = () => {
        setIsOpen(false);
    };

    const openModal = () => {
        setIsOpen(true);
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
        openModal,
        onClose,
        selectedPlan,
        handleSelectPlan,
        formatFeatureValue,
        calculateSavings,
        formatPrice,
        getSelectedPlanName,
        setSelectedPlan,
        loading,
        error,
        plans,
        yearlyPlan,
        monthlyPlan,
        freePlan,
        proPlans,
    };
}
