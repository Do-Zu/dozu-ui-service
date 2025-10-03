'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Shield, Coins } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePointsManagement } from '@/contexts/gamification/GamificationContext';

interface StreakFreezeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStreak: number;
    currentPoints: number;
    onPurchaseSuccess: () => void;
}

export default function StreakFreezeModal({
    isOpen,
    onClose,
    currentStreak,
    currentPoints,
    onPurchaseSuccess,
}: StreakFreezeModalProps) {
    const t = useTranslations('streak');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { buyStreakFreeze } = usePointsManagement();

    const freezeCost = 100; // Default cost, could be dynamic
    const canAfford = currentPoints >= freezeCost;

    const handlePurchase = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const success = await buyStreakFreeze(freezeCost);
            if (success) {
                onPurchaseSuccess();
                onClose();
                
                // Show success notification
                console.log('Streak freeze purchased successfully!');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to purchase streak freeze';
            setError(errorMessage);
            console.error('Error purchasing streak freeze:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        {t('buyStreakFreeze')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('streakFreezeDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current Streak Display */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Flame className="h-5 w-5 text-orange-500" />
                                    <span className="font-medium">{t('currentStreak')}</span>
                                </div>
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                    {currentStreak} {t('days')}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                {currentStreak} {t('currentStreakToProtect')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Purchase Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-3 text-center">
                                <Shield className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                                <p className="text-sm font-medium">{t('protection')}</p>
                                <p className="text-xs text-muted-foreground">1 {t('day')}</p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-3 text-center">
                                <Coins className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                                <p className="text-sm font-medium">{t('cost')}</p>
                                <p className="text-xs text-muted-foreground">{freezeCost} {t('points')}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Points Display */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{t('currentPoints')}</span>
                            <span className="text-sm font-bold">{currentPoints}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{t('afterPurchase')}</span>
                            <span className={`text-sm font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                                {currentPoints - freezeCost}
                            </span>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">{t('benefits')}:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• {t('benefitKeepStreak')}</li>
                            <li>• {t('benefitNoReset')}</li>
                            <li>• {t('benefitFlexibility')}</li>
                        </ul>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Insufficient Points Warning */}
                    {!canAfford && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                {t('insufficientPoints', { needed: freezeCost - currentPoints })}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        {t('cancel', { ns: 'common' })}
                    </Button>
                    <Button 
                        onClick={handlePurchase} 
                        disabled={!canAfford || isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {t('purchasing', { ns: 'common' })}
                            </>
                        ) : (
                            <>
                                <Shield className="h-4 w-4 mr-2" />
                                {t('purchase')} ({freezeCost} {t('points')})
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}