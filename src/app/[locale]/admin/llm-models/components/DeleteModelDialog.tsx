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
import { LlmModel } from '@/types/llmModel';
import { AlertTriangle } from 'lucide-react';
import errorHelper from '@/utils/error.helper';
import { getProviderBadgeClass } from '@/utils/providerColors';
import { Badge } from '@/components/ui/badge';

interface DeleteModelDialogProps {
    model: LlmModel;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeleteModelDialog({ model, open, onOpenChange, onSuccess }: DeleteModelDialogProps) {
    const [confirmText, setConfirmText] = useState('');

    const expectedText = model.name.toUpperCase();

    const { execute: deleteModel, loading } = usePost(
        `/admin/llm-models/${model.modelId}`,
        'DELETE',
        {
            onError: (error: any) => {
                const errorMessage = errorHelper.getErrorMessage(error);
                toast({
                    description: errorMessage || 'Failed to delete model',
                    variant: 'destructive',
                });
            },
            onMessageSuccess: () => {
                toast({ description: 'Model deleted successfully' });
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

        await deleteModel({});
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
                        Delete Model: {model.name}
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the model and may affect related API keys and configurations.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleDelete} className="space-y-4">
                    {/* Model Info */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Model ID:</span>
                            <span className="font-medium">{model.modelId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{model.name}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-muted-foreground">Provider:</span>
                            <Badge className={getProviderBadgeClass(model.providerName || `Provider ${model.providerId}`)}>
                                {model.providerName || `Provider ${model.providerId}`}
                            </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Priority:</span>
                            <span className="font-medium">{model.priority}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-medium">
                                {model.isAvailable ? 'Available' : 'Unavailable'}
                                {model.isDefault && ' (Default)'}
                            </span>
                        </div>
                        {model.description && (
                            <div className="pt-2 border-t border-border">
                                <span className="text-sm text-muted-foreground">Description:</span>
                                <p className="text-sm mt-1">{model.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Warning */}
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive font-medium">
                            ⚠️ Warning:
                        </p>
                        <ul className="text-sm text-destructive mt-2 ml-4 list-disc space-y-1">
                            <li>API keys linked to this model may become invalid</li>
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
                            {loading ? 'Deleting...' : 'Delete Model'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

