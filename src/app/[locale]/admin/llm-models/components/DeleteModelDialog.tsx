'use client';

import { LlmModel } from '@/types/llm-admin/llmModel';
import { DeleteConfirmationDialog, DeleteConfirmationDialogConfig } from '@/components/admin/DeleteConfirmationDialog';
import { getProviderBadgeClass } from '@/utils/providerColors';
import { Badge } from '@/components/ui/badge';

interface DeleteModelDialogProps {
    model: LlmModel;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeleteModelDialog({ model, open, onOpenChange, onSuccess }: DeleteModelDialogProps) {
    const config: DeleteConfirmationDialogConfig<LlmModel> = {
        entity: model,
        entityName: 'Model',
        entityDisplayName: model.name,
        entityId: model.modelId,
        endpoint: `/admin/llm-models/${model.modelId}`,
        description:
            'This action cannot be undone. This will permanently delete the model and may affect related API keys and configurations.',
        renderInfoFields: (model) => (
            <>
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
            </>
        ),
        warningMessages: [
            'API keys linked to this model may become invalid',
            'This action is permanent and cannot be reversed',
        ],
        successMessage: 'Model deleted successfully',
        errorMessage: 'Failed to delete model',
        deleteButtonText: 'Delete Model',
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

