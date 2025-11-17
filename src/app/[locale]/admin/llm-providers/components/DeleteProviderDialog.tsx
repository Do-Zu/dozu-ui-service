'use client';

import { LlmProvider } from '@/types/llm-admin/llmProvider';
import { DeleteConfirmationDialog, DeleteConfirmationDialogConfig } from '@/components/admin/DeleteConfirmationDialog';
import { ROUTES } from '@/utils/constants/routes';

interface DeleteProviderDialogProps {
    provider: LlmProvider;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeleteProviderDialog({ provider, open, onOpenChange, onSuccess }: DeleteProviderDialogProps) {
    const config: DeleteConfirmationDialogConfig<LlmProvider> = {
        entity: provider,
        entityName: 'Provider',
        entityDisplayName: provider.name,
        entityId: provider.providerId,
        endpoint: ROUTES.LLM_PROVIDERS_DELETE(provider.providerId),
        description:
            'This action cannot be undone. This will permanently delete the provider and may affect related models and API keys.',
        renderInfoFields: (provider) => (
            <>
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
            </>
        ),
        warningMessages: [
            'All models associated with this provider may be affected',
            'API keys linked to this provider may become invalid',
            'This action is permanent and cannot be reversed',
        ],
        successMessage: 'Provider deleted successfully',
        errorMessage: 'Failed to delete provider',
        deleteButtonText: 'Delete Provider',
    };

    return (
        <DeleteConfirmationDialog
            open={open}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
            config={config}
        />
    );
}

