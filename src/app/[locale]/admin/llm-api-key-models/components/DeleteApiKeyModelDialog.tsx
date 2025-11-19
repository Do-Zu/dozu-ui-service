'use client';

import { LlmApiKeyModel } from '@/types/llm-admin/llmApiKeyModel';
import { DeleteConfirmationDialog, DeleteConfirmationDialogConfig } from '@/components/admin/DeleteConfirmationDialog';
import { getProviderBadgeClass } from '@/utils/providerColors';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/utils/constants/routes';

interface DeleteApiKeyModelDialogProps {
    relation: LlmApiKeyModel;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeleteApiKeyModelDialog({ relation, open, onOpenChange, onSuccess }: DeleteApiKeyModelDialogProps) {
    const config: DeleteConfirmationDialogConfig<LlmApiKeyModel> = {
        entity: relation,
        entityName: 'Relation',
        entityDisplayName: `Relation ${relation.id}`,
        entityId: relation.id,
        endpoint: ROUTES.LLM_API_KEY_MODELS_DELETE(relation.id),
        description:
            'This action cannot be undone. This will permanently delete the API key-model relation.',
        renderInfoFields: (relation) => (
            <>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Relation ID:</span>
                    <span className="font-medium">{relation.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Provider:</span>
                    <Badge className={getProviderBadgeClass(relation.providerName || 'Unknown')}>
                        {relation.providerName || 'Unknown'}
                    </Badge>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Model:</span>
                    <span className="font-medium">{relation.modelName || `Model ${relation.modelId}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">API Key ID:</span>
                    <span className="font-mono text-xs">{relation.apiKeyId}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Requests/Min:</span>
                    <span className="font-medium">{relation.requestPerMinute}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Requests/Day:</span>
                    <span className="font-medium">{relation.requestPerDay}</span>
                </div>
            </>
        ),
        warningMessages: [
            'This will remove the rate limit configuration for this API key-model pair',
            'This action is permanent and cannot be reversed',
        ],
        successMessage: 'Relation deleted successfully',
        errorMessage: 'Failed to delete relation',
        deleteButtonText: 'Delete Relation',
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

