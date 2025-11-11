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
import { LlmProvider } from '@/types/llmProvider';
import { AlertTriangle } from 'lucide-react';
import errorHelper from '@/utils/error.helper';

interface DeleteProviderDialogProps {
    provider: LlmProvider;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeleteProviderDialog({ provider, open, onOpenChange, onSuccess }: DeleteProviderDialogProps) {
    const [confirmText, setConfirmText] = useState('');

    const expectedText = provider.name.toUpperCase();

    const { execute: deleteProvider, loading } = usePost(
        `/admin/llm-providers/${provider.providerId}`,
        'DELETE',
        {
            onError: (error: any) => {
                const errorMessage = errorHelper.getErrorMessage(error);
                toast({
                    description: errorMessage || 'Failed to delete provider',
                    variant: 'destructive',
                });
            },
            onMessageSuccess: () => {
                toast({ description: 'Provider deleted successfully' });
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

        await deleteProvider({});
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
                        Delete Provider: {provider.name}
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the provider and may affect related models and API keys.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleDelete} className="space-y-4">
                    {/* Provider Info */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Provider ID:</span>
                            <span className="font-medium">{provider.providerId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{provider.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Index:</span>
                            <span className="font-medium">{provider.index}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-medium">
                                {provider.isAvailable ? 'Available' : 'Unavailable'}
                                {provider.isDefault && ' (Default)'}
                            </span>
                        </div>
                        {provider.baseUrl && (
                            <div className="pt-2 border-t border-border">
                                <span className="text-sm text-muted-foreground">Base URL:</span>
                                <p className="text-sm mt-1 font-mono break-all">{provider.baseUrl}</p>
                            </div>
                        )}
                        {provider.description && (
                            <div className="pt-2 border-t border-border">
                                <span className="text-sm text-muted-foreground">Description:</span>
                                <p className="text-sm mt-1">{provider.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Warning */}
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive font-medium">
                            ⚠️ Warning:
                        </p>
                        <ul className="text-sm text-destructive mt-2 ml-4 list-disc space-y-1">
                            <li>All models associated with this provider may be affected</li>
                            <li>API keys linked to this provider may become invalid</li>
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
                            {loading ? 'Deleting...' : 'Delete Provider'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

