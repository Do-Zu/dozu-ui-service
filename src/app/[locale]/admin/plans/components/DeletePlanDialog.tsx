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
import { Plan } from '@/types/subscription';
import { AlertTriangle } from 'lucide-react';

interface DeletePlanDialogProps {
    plan: Plan;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeletePlanDialog({ plan, open, onOpenChange, onSuccess }: DeletePlanDialogProps) {
    const [confirmText, setConfirmText] = useState('');

    const expectedText = plan.name.toUpperCase();

    const { execute: deletePlan, loading } = usePost(
        `/admin/subscription/plans/${plan.planId}`,
        'DELETE',
        {
            onError: (error: any) => {
                toast({
                    description: error?.message || 'Failed to delete plan',
                    variant: 'destructive',
                });
            },
            onMessageSuccess: () => {
                toast({ description: 'Plan deleted successfully' });
                onSuccess();
                onOpenChange(false);
                resetForm();
            },
        }
    );

    const resetForm = () => {
        setConfirmText('');
    };

    const handleDelete = async (e?: React.FormEvent) => {
        e?.preventDefault();
        
        if (confirmText !== expectedText) {
            toast({
                description: `Please type "${expectedText}" to confirm`,
                variant: 'destructive',
            });
            return;
        }

        await deletePlan({});
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
                        Delete Plan: {plan.name}
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the plan and all associated data.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleDelete} className="space-y-4">
                    {/* Plan Info */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Plan ID:</span>
                            <span className="font-medium">{plan.planId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium uppercase">{plan.planType}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Billing:</span>
                            <span className="font-medium capitalize">{plan.billingInterval}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Price:</span>
                            <span className="font-bold">
                                {plan.price} {plan.currency}
                            </span>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive font-medium">
                            ⚠️ Warning:
                        </p>
                        <ul className="text-sm text-destructive mt-2 ml-4 list-disc space-y-1">
                            <li>All features assigned to this plan will be removed</li>
                            <li>Plan cannot be deleted if users have active subscriptions</li>
                            <li>This action is permanent and cannot be reversed</li>
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
                            onChange={(e) => setConfirmText(e.target.value)}
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
                            {loading ? 'Deleting...' : 'Delete Plan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


