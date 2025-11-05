'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { PlanFeature } from '@/types/subscription';
import { AlertTriangle } from 'lucide-react';

interface RemoveFeatureDialogProps {
    feature: PlanFeature;
    planName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function RemoveFeatureDialog({ feature, planName, open, onOpenChange, onSuccess }: RemoveFeatureDialogProps) {
    const [confirmText, setConfirmText] = useState('');

    const expectedText = 'REMOVE';

    const { execute: removeFeature, loading } = usePost(
        `/admin/subscription/plan-features/${feature.planFeatureId}`,
        'DELETE',
        {
            onError: (error: any) => {
                toast({
                    description: error?.message || 'Failed to remove feature',
                    variant: 'destructive',
                });
            },
            onMessageSuccess: () => {
                toast({ description: 'Feature removed successfully' });
                onSuccess();
                onOpenChange(false);
                resetForm();
            },
        }
    );

    const resetForm = () => {
        setConfirmText('');
    };

    const handleRemove = async (e?: React.FormEvent) => {
        e?.preventDefault();
        
        if (confirmText !== expectedText) {
            toast({
                description: `Please type "${expectedText}" to confirm`,
                variant: 'destructive',
            });
            return;
        }

        await removeFeature({});
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) resetForm();
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Remove Feature: {feature.featureName}
                    </DialogTitle>
                    <DialogDescription>
                        This will remove this feature from the "{planName}" plan. Users with this plan will lose access to this feature.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleRemove} className="space-y-4">
                    {/* Feature Info */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Feature:</span>
                            <span className="font-medium">{feature.featureName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium capitalize">{feature.featureType}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Category:</span>
                            <span className="font-medium capitalize">{feature.category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Reset Interval:</span>
                            <span className="font-medium capitalize">{feature.interval}</span>
                        </div>
                        {feature.featureDescription && (
                            <div className="pt-2 border-t border-border">
                                <span className="text-sm text-muted-foreground">Description:</span>
                                <p className="text-sm mt-1">{feature.featureDescription}</p>
                            </div>
                        )}
                    </div>

                    {/* Warning */}
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive font-medium">
                            ⚠️ Warning:
                        </p>
                        <ul className="text-sm text-destructive mt-2 ml-4 list-disc space-y-1">
                            <li>This feature will be removed from the "{planName}" plan</li>
                            <li>Users currently subscribed to this plan may lose access to this feature</li>
                            <li>This action cannot be undone (but you can re-assign the feature later)</li>
                        </ul>
                    </div>

                    {/* Confirmation Input */}
                    <div className="space-y-2">
                        <Label htmlFor="confirm">
                            Type <span className="font-mono font-bold">{expectedText}</span> to confirm *
                        </Label>
                        <Input
                            id="confirm"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                            placeholder={`Type ${expectedText} here`}
                            autoComplete="off"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={loading || confirmText !== expectedText}
                        >
                            {loading ? 'Removing...' : 'Remove Feature'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

