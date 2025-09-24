'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpgradePlanModal } from '@/stores/features/subscription/useUpgradePlanModal';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

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
    billingInterval: 'monthly' | 'yearly';
    price: string;
    currency: string;
    isActive: boolean;
    features: PlanFeature[];
}

export default function UpgradePlanModal() {
    const {
        loading,
        isOpen,
        error,
        calculateSavings,
        onClose,
        formatFeatureValue,
        formatPrice,
        getSelectedPlanName,
        handleSelectPlan,
        setSelectedPlan,
        yearlyPlan,
        monthlyPlan,
        selectedPlan,
        proPlans,
    } = useUpgradePlanModal();

    if (loading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[480px] h-[95vh]">
                    <div className="flex items-center justify-center p-8">
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
                <DialogContent className="sm:max-w-[480px] h-[95vh]">
                    <div className="p-8 text-center">
                        <div className="text-red-500 mb-4">⚠️ Error loading plans</div>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={onClose} variant="outline">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] h-[95vh] overflow-y-hidden rounded-lg z-[1005]">
                <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-gray-400 hover:">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>

                <div className="p-4">
                    <DialogHeader className="text-center mb-6">
                        <DialogTitle className="text-2xl font-bold ">Upgrade Your Plan</DialogTitle>
                        <p className="text-gray-400 mt-2">Choose the plan that best fits your needs</p>
                    </DialogHeader>

                    {/* Features List */}
                    {yearlyPlan && yearlyPlan.features.length > 0 && (
                        <div className="mb-8 max-h-[25%] overflow-y-auto">
                            <h3 className="text-base font-semibold mb-4">What's included:</h3>
                            <ul className="space-y-3">
                                {yearlyPlan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-600 dark:text-gray-200 leading-relaxed">
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

                    {/* Show features from monthly plan if yearly plan has no features */}
                    {(!yearlyPlan || yearlyPlan.features.length === 0) &&
                        monthlyPlan &&
                        monthlyPlan.features.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-base font-semibold mb-4">What's included:</h3>
                                <ul className="space-y-3">
                                    {monthlyPlan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-600 dark:text-gray-200 leading-relaxed">
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

                    <div className="space-y-3 mb-8">
                        {/* Yearly Plan */}
                        {yearlyPlan && (
                            <div
                                className={cn(
                                    'relative p-3 rounded-lg border-2 cursor-pointer transition-all',
                                    selectedPlan === yearlyPlan.planId
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-gray-700 hover:border-gray-600',
                                )}
                                onClick={() => setSelectedPlan(yearlyPlan.planId)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                                                selectedPlan === yearlyPlan.planId
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-500',
                                            )}
                                        >
                                            {selectedPlan === yearlyPlan.planId && (
                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{yearlyPlan.name}</span>
                                                {monthlyPlan && (
                                                    <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded-full font-medium">
                                                        Save{' '}
                                                        {calculateSavings(
                                                            parseFloat(monthlyPlan.price),
                                                            parseFloat(yearlyPlan.price),
                                                        )}
                                                        %
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{yearlyPlan.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-base font-bold">
                                            {formatPrice(yearlyPlan.price, yearlyPlan.currency)} / year
                                        </div>
                                        {monthlyPlan && (
                                            <div className="text-xs text-gray-500">
                                                {formatPrice(
                                                    (parseFloat(yearlyPlan.price) / 12).toFixed(2),
                                                    yearlyPlan.currency,
                                                )}{' '}
                                                / month
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Monthly Plan */}
                        {monthlyPlan && (
                            <div
                                className={cn(
                                    'relative p-3 rounded-lg border-2 cursor-pointer transition-all',
                                    selectedPlan === monthlyPlan.planId
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-gray-700 hover:border-gray-600',
                                )}
                                onClick={() => setSelectedPlan(monthlyPlan.planId)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                                                selectedPlan === monthlyPlan.planId
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-500',
                                            )}
                                        >
                                            {selectedPlan === monthlyPlan.planId && (
                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                            )}
                                        </div>
                                        <div>
                                            <span className="font-medium">{monthlyPlan.name}</span>
                                            <p className="text-xs text-gray-500 mt-1">{monthlyPlan.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">
                                            {formatPrice(monthlyPlan.price, monthlyPlan.currency)} / month
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Select Plan Button */}
                    <Button
                        onClick={handleSelectPlan}
                        className="w-full hover:bg-gray-200 font-medium h-12 rounded-lg"
                        disabled={!selectedPlan}
                    >
                        {selectedPlan ? `Upgrade to ${getSelectedPlanName()}` : 'Select Plan'}
                    </Button>

                    {/* No plans available message */}
                    {proPlans.length === 0 && !loading && (
                        <div className="text-center py-4 text-gray-500">No upgrade plans available at the moment.</div>
                    )}

                    {/* Footer */}
                    {/* <div className="mt-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                            <span>Join thousands of users already enjoying premium features</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                            Need help?{' '}
                            <button className="text-blue-500 hover:text-blue-600 underline">Contact Support</button>
                        </div>
                    </div> */}
                </div>
            </DialogContent>
        </Dialog>
    );
}
