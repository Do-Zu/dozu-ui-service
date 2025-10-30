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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { Payment } from '@/types/payment';
import { AlertTriangle } from 'lucide-react';

interface RefundDialogProps {
    payment: Payment;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function RefundDialog({ payment, open, onOpenChange, onSuccess }: RefundDialogProps) {
    const [reason, setReason] = useState('');
    const [isPartialRefund, setIsPartialRefund] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');

    const { execute: refund, loading } = usePost('/admin/payments/transactions/refund', 'POST', {
        onError: (error: any) => {
            toast({ 
                description: error?.message || 'Failed to process refund', 
                variant: 'destructive' 
            });
        },
        onMessageSuccess: () => {
            toast({ description: 'Refund processed successfully' });
            onSuccess();
            onOpenChange(false);
            resetForm();
        },
    });

    const resetForm = () => {
        setReason('');
        setIsPartialRefund(false);
        setRefundAmount('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!reason.trim()) {
            toast({ description: 'Please provide a refund reason', variant: 'destructive' });
            return;
        }

        if (isPartialRefund && (!refundAmount || parseFloat(refundAmount) <= 0)) {
            toast({ description: 'Please enter a valid refund amount', variant: 'destructive' });
            return;
        }

        if (isPartialRefund && parseFloat(refundAmount) > parseFloat(payment.amount)) {
            toast({ description: 'Refund amount cannot exceed original amount', variant: 'destructive' });
            return;
        }

        await refund({
            transactionId: payment.transactionId,
            reason: reason.trim(),
            amount: isPartialRefund ? refundAmount : undefined,
        });
    };

    const maxAmount = parseFloat(payment.amount);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Refund Transaction
                    </DialogTitle>
                    <DialogDescription>
                        Process a refund for this transaction. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Transaction Info */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Transaction ID:</span>
                            <span className="font-medium">{payment.transactionId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">User:</span>
                            <span className="font-medium">{payment.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Gateway:</span>
                            <span className="font-medium uppercase">{payment.gateway}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Original Amount:</span>
                            <span className="font-bold">
                                {maxAmount.toLocaleString()} {payment.currency}
                            </span>
                        </div>
                    </div>

                    {/* Partial Refund Option */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="partialRefund"
                            checked={isPartialRefund}
                            onCheckedChange={(checked) => setIsPartialRefund(checked as boolean)}
                        />
                        <Label htmlFor="partialRefund" className="cursor-pointer">
                            Partial refund
                        </Label>
                    </div>

                    {/* Refund Amount */}
                    {isPartialRefund && (
                        <div className="space-y-2">
                            <Label htmlFor="amount">Refund Amount *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={maxAmount}
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                                placeholder={`Max: ${maxAmount}`}
                                required={isPartialRefund}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter amount to refund (max: {maxAmount.toLocaleString()} {payment.currency})
                            </p>
                        </div>
                    )}

                    {/* Refund Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">Refund Reason *</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why this refund is being processed..."
                            rows={4}
                            required
                        />
                    </div>

                    {/* Warning */}
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive font-medium">
                            ⚠️ Warning: This will process a {isPartialRefund ? 'partial' : 'full'} refund through {payment.gateway}.
                            Make sure you have verified this request.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive" disabled={loading}>
                            {loading ? 'Processing...' : `Refund ${isPartialRefund ? refundAmount : maxAmount} ${payment.currency}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

