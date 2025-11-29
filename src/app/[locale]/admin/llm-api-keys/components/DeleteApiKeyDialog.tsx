'use client';

import { LlmApiKey } from '@/types/llm-admin/llmApiKey';
import { DeleteConfirmationDialog, DeleteConfirmationDialogConfig } from '@/components/admin/DeleteConfirmationDialog';
import { getProviderBadgeClass } from '@/utils/providerColors';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/utils/constants/routes';

interface DeleteApiKeyDialogProps {
    apiKey: LlmApiKey;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeleteApiKeyDialog({ apiKey, open, onOpenChange, onSuccess }: DeleteApiKeyDialogProps) {
    const maskedKey = apiKey.keyValue.length > 12 
        ? `${apiKey.keyValue.substring(0, 8)}...${apiKey.keyValue.substring(apiKey.keyValue.length - 4)}`
        : '***';

    const config: DeleteConfirmationDialogConfig<LlmApiKey> = {
        entity: apiKey,
        entityName: 'API Key',
        entityDisplayName: `API Key ${apiKey.keyId}`,
        entityId: apiKey.keyId,
        endpoint: ROUTES.LLM_API_KEYS_DELETE(apiKey.keyId),
        description:
            'This action cannot be undone. This will permanently delete the API key and may affect related model configurations.',
        renderInfoFields: (apiKey) => (
            <>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Key ID:</span>
                    <span className="font-medium">{apiKey.keyId}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Provider:</span>
                    <Badge className={getProviderBadgeClass(apiKey.providerName || `Provider ${apiKey.providerId}`)}>
                        {apiKey.providerName || `Provider ${apiKey.providerId}`}
                    </Badge>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">API Key:</span>
                    <span className="font-mono text-xs">{maskedKey}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{apiKey.keyType === 'paid' ? 'Paid' : 'Free'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{apiKey.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Priority:</span>
                    <span className="font-medium">{apiKey.priority}</span>
                </div>
                {apiKey.usageLimitPerDay && (
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Usage Limit/Day:</span>
                        <span className="font-medium">{apiKey.usageLimitPerDay}</span>
                    </div>
                )}
            </>
        ),
        warningMessages: [
            'Model relations linked to this API key may become invalid',
            'This action is permanent and cannot be reversed',
        ],
        successMessage: 'API key deleted successfully',
        errorMessage: 'Failed to delete API key',
        deleteButtonText: 'Delete API Key',
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

