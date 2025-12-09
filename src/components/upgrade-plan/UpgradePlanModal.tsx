'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpgradePlanModal } from '@/stores/features/subscription/useUpgradePlanModal';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { isEmpty } from '@/utils';
import DataStatus from '../errors/DataStatus';
import { useEffect } from 'react';

export interface PlanFeature {
    planId: number;
    featureId: number;
    name: string;
    description: string;
    booleanValue: boolean | null;
    numericValue: string | null;
    textValue: string | null;
    isUnlimited: boolean;
    isEnabled: boolean;
}

export interface Plan {
    planId: number;
    name: string;
    description: string;
    planType: string;
    billingInterval: string;
    price: string;
    currency: string;
    isActive: boolean;
    tier: number;
    features: PlanFeature[];
}

export default function UpgradePlanModal() {
    const {
        loading,
        isOpen,
        error,
        selectedPlan,
        plans,
        onClose,
        formatFeatureValue,
        formatPrice,
        getSelectedPlanName,
        handleSelectPlan,
        setSelectedPlan,
    } = useUpgradePlanModal();

    const getDefaultPlanSelect = () => {
        if (isEmpty(plans)) {
            return;
        }

        const defaultSelectedPlan = plans.reduce((minPlan, currentPlan) => {
            if (currentPlan.tier < minPlan.tier) {
                return currentPlan;
            } else if (currentPlan.tier === minPlan.tier) {
                return currentPlan.price < minPlan.price ? currentPlan : minPlan;
            } else {
                return minPlan;
            }
        });

        setSelectedPlan(defaultSelectedPlan);
    };

    useEffect(() => {
        getDefaultPlanSelect();
    }, [plans]);

    const classNameContainerWrap =
        'sm:max-w-[480px] w-[calc(100vw-2rem)] max-h-[90vh] overflow-hidden rounded-lg z-[1005] flex flex-col';

    if (loading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className={classNameContainerWrap}>
                    <div className="flex flex-1 items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3">Loading plans...</span>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (error) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className={classNameContainerWrap}>
                    <DataStatus
                        variant="error"
                        action={{
                            label: 'Close',
                            onClick: () => onClose(),
                        }}
                        className="flex-1"
                    />
                </DialogContent>
            </Dialog>
        );
    }

    if (isEmpty(plans)) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className={classNameContainerWrap}>
                    <DataStatus
                        variant="empty"
                        title={'Your credit today exceed, Back to tomorrow'}
                        action={{
                            label: 'Close',
                            onClick: () => onClose(),
                        }}
                        className="flex-1"
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={classNameContainerWrap}>
                <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>

                {/* Outer flex column, header + scrollable content + fixed button */}
                <div className="flex h-full flex-col p-4 gap-6 overflow-hidden">
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-2xl font-bold">Upgrade Your Plan</DialogTitle>
                        <p className="text-gray-400 mt-2">Choose the plan that best fits your needs</p>
                    </DialogHeader>

                    {/* Scrollable middle area */}
                    <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                        {selectedPlan && !isEmpty(selectedPlan.features) && (
                            <div>
                                <h3 className="text-base font-semibold mb-4">What's included:</h3>
                                <ul className="space-y-3">
                                    {selectedPlan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-xs text-gray-600 dark:text-gray-200 leading-relaxed">
                                                <strong>{feature.name}:</strong> {formatFeatureValue(feature)}
                                                {feature.description && (
                                                    <span className="text-xs text-gray-500 block mt-1">
                                                        {feature.description}
                                                    </span>
                                                )}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-3">
                            {plans.map((plan) => (
                                <div
                                    key={plan.planId}
                                    className={cn(
                                        'relative p-3 rounded-lg border-2 cursor-pointer transition-all',
                                        selectedPlan?.planId === plan.planId
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-gray-700 hover:border-gray-600',
                                    )}
                                    onClick={() => setSelectedPlan(plan)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                                                    selectedPlan?.planId === plan.planId
                                                        ? 'border-blue-500 bg-blue-500'
                                                        : 'border-gray-500',
                                                )}
                                            >
                                                {selectedPlan?.planId === plan.planId && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-medium">{plan?.name}</span>
                                                <p className="text-xs text-gray-500 mt-1">{plan?.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">
                                                {formatPrice(plan?.price, plan?.currency)} / month
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fixed bottom button */}
                    <Button
                        onClick={handleSelectPlan}
                        className="w-full hover:bg-gray-200 font-medium h-12 rounded-lg"
                        disabled={!selectedPlan}
                    >
                        {selectedPlan ? `Upgrade to ${getSelectedPlanName()}` : 'Select Plan'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
