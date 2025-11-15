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
import { AlertTriangle } from 'lucide-react';
import errorHelper from '@/utils/error.helper';

export interface DeleteConfirmationDialogConfig<T> {
    entity: T;
    entityName: string; // e.g., "Model" or "Provider"
    entityDisplayName: string; // e.g., model.name or provider.name
    entityId: number; // e.g., model.modelId or provider.providerId
    endpoint: string; // e.g., `/admin/llm-models/${id}` or `/admin/llm-providers/${id}`
    description: string; // Dialog description
    renderInfoFields: (entity: T) => React.ReactNode; // Custom info fields renderer
    warningMessages: string[]; // Array of warning messages
    successMessage: string; // e.g., "Model deleted successfully"
    errorMessage: string; // e.g., "Failed to delete model"
    deleteButtonText: string; // e.g., "Delete Model" or "Delete Provider"
}

interface DeleteConfirmationDialogProps<T> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    config: DeleteConfirmationDialogConfig<T>;
}

export function DeleteConfirmationDialog<T>({
    open,
    onOpenChange,
    onSuccess,
    config,
}: DeleteConfirmationDialogProps<T>) {
    const [confirmText, setConfirmText] = useState('');

    const expectedText = config.entityDisplayName.toUpperCase();

    const { execute: deleteEntity, loading } = usePost(config.endpoint, 'DELETE', {
        onError: (error: any) => {
            const errorMessage = errorHelper.getErrorMessage(error);
            toast({
                description: errorMessage || config.errorMessage,
                variant: 'destructive',
            });
        },
        onMessageSuccess: () => {
            toast({ description: config.successMessage });
            onSuccess();
            onOpenChange(false);
            resetForm();
        },
    });

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

        await deleteEntity({});
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
                        Delete {config.entityName}: {config.entityDisplayName}
                    </DialogTitle>
                    <DialogDescription>{config.description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleDelete} className="space-y-4">
                    {/* Entity Info */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        {config.renderInfoFields(config.entity)}
                    </div>

                    {/* Warning */}
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive font-medium">⚠️ Warning:</p>
                        <ul className="text-sm text-destructive mt-2 ml-4 list-disc space-y-1">
                            {config.warningMessages.map((message, index) => (
                                <li key={index}>{message}</li>
                            ))}
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
                            {loading ? 'Deleting...' : config.deleteButtonText}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

