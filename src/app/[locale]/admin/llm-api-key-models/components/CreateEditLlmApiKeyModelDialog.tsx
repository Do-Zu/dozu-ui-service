'use client';

import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { CreateLlmApiKeyModelInput, UpdateLlmApiKeyModelInput, LlmApiKeyModel } from '@/types/llm-admin/llmApiKeyModel';
import { LlmApiKey, LlmApiKeysResponse } from '@/types/llm-admin/llmApiKey';
import { LlmModel, LlmModelsResponse } from '@/types/llm-admin/llmModel';
import errorHelper from '@/utils/error.helper';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { ROUTES } from '@/utils/constants/routes';

interface CreateEditLlmApiKeyModelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    relation?: LlmApiKeyModel | null;
}

export function CreateEditLlmApiKeyModelDialog({
    open,
    onOpenChange,
    onSuccess,
    relation,
}: CreateEditLlmApiKeyModelDialogProps) {
    const [formData, setFormData] = useState<CreateLlmApiKeyModelInput>({
        apiKeyId: 0,
        modelId: 0,
        requestPerMinute: 10,
        requestPerDay: 1000,
    });
    const [apiKeys, setApiKeys] = useState<LlmApiKey[]>([]);
    const [models, setModels] = useState<LlmModel[]>([]);
    const [loadingApiKeys, setLoadingApiKeys] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);

    const isEditMode = !!relation;

    // Fetch API keys on mount
    useEffect(() => {
        const fetchApiKeys = async () => {
            try {
                setLoadingApiKeys(true);
                const response: ApiResponse<LlmApiKeysResponse> = await getRequest<unknown, LlmApiKeysResponse>(
                    ROUTES.LLM_API_KEYS_LIST('limit=100')
                );
                setApiKeys(response.data?.apiKeys || []);
            } catch (error) {
                console.error('Failed to fetch API keys:', error);
                toast({
                    description: 'Failed to load API keys list',
                    variant: 'destructive',
                });
            } finally {
                setLoadingApiKeys(false);
            }
        };

        if (open) {
            fetchApiKeys();
        }
    }, [open]);

    // Fetch models on mount
    useEffect(() => {
        const fetchModels = async () => {
            try {
                setLoadingModels(true);
                const response: ApiResponse<LlmModelsResponse> = await getRequest<unknown, LlmModelsResponse>(
                    ROUTES.LLM_MODELS_LIST('limit=100')
                );
                setModels(response.data?.models || []);
            } catch (error) {
                console.error('Failed to fetch models:', error);
                toast({
                    description: 'Failed to load models list',
                    variant: 'destructive',
                });
            } finally {
                setLoadingModels(false);
            }
        };

        if (open) {
            fetchModels();
        }
    }, [open]);

    // Initialize form data when relation changes
    useEffect(() => {
        if (relation) {
            setFormData({
                apiKeyId: relation.apiKeyId,
                modelId: relation.modelId,
                requestPerMinute: relation.requestPerMinute,
                requestPerDay: relation.requestPerDay,
            });
        } else {
            resetForm();
        }
    }, [relation]);

    const resetForm = () => {
        setFormData({
            apiKeyId: 0,
            modelId: 0,
            requestPerMinute: 10,
            requestPerDay: 1000,
        });
    };

    const { execute: createRelation, loading: createLoading } = usePost(
        ROUTES.LLM_API_KEY_MODELS_CREATE,
        'POST',
        {
            onError: (error) => {
                const errorMessage = errorHelper.getErrorMessage(error);
                toast({
                    description: errorMessage || 'Failed to create relation',
                    variant: 'destructive',
                });
            },
            onMessageSuccess: () => {
                toast({ description: 'Relation created successfully' });
                onSuccess();
            },
        }
    );

    const { execute: updateRelation, loading: updateLoading } = usePost(
        ROUTES.LLM_API_KEY_MODELS_UPDATE(relation?.id || 0),
        'PATCH',
        {
            onError: (error) => {
                const errorMessage = errorHelper.getErrorMessage(error);
                toast({
                    description: errorMessage || 'Failed to update relation',
                    variant: 'destructive',
                });
            },
            onMessageSuccess: () => {
                toast({ description: 'Relation updated successfully' });
                onSuccess();
            },
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.apiKeyId || formData.apiKeyId === 0) {
            toast({
                description: 'Please select an API key',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.modelId || formData.modelId === 0) {
            toast({
                description: 'Please select a model',
                variant: 'destructive',
            });
            return;
        }

        if (formData.requestPerMinute <= 0) {
            toast({
                description: 'Request per minute must be greater than 0',
                variant: 'destructive',
            });
            return;
        }

        if (formData.requestPerDay <= 0) {
            toast({
                description: 'Request per day must be greater than 0',
                variant: 'destructive',
            });
            return;
        }

        if (isEditMode) {
            const updatePayload: UpdateLlmApiKeyModelInput = {
                apiKeyId: formData.apiKeyId,
                modelId: formData.modelId,
                requestPerMinute: formData.requestPerMinute,
                requestPerDay: formData.requestPerDay,
            };
            await updateRelation(updatePayload);
        } else {
            const createPayload: CreateLlmApiKeyModelInput = {
                apiKeyId: formData.apiKeyId,
                modelId: formData.modelId,
                requestPerMinute: formData.requestPerMinute,
                requestPerDay: formData.requestPerDay,
            };
            await createRelation(createPayload);
        }
    };

    const loading = createLoading || updateLoading;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Relation' : 'Create Relation'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the API key-model relation information below.'
                            : 'Link an API key to a model and set rate limits.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="apiKeyId">
                                API Key <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.apiKeyId.toString()}
                                onValueChange={(value) => setFormData({ ...formData, apiKeyId: parseInt(value, 10) })}
                                disabled={loading || loadingApiKeys}
                            >
                                <SelectTrigger id="apiKeyId">
                                    <SelectValue placeholder="Select an API key" />
                                </SelectTrigger>
                                <SelectContent>
                                    {apiKeys.map((apiKey) => {
                                        const maskedKey = apiKey.keyValue.length > 12 
                                            ? `${apiKey.keyValue.substring(0, 8)}...${apiKey.keyValue.substring(apiKey.keyValue.length - 4)}`
                                            : '***';
                                        return (
                                            <SelectItem key={apiKey.keyId} value={apiKey.keyId.toString()}>
                                                {apiKey.providerName || `Provider ${apiKey.providerId}`} - {maskedKey}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="modelId">
                                Model <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.modelId.toString()}
                                onValueChange={(value) => setFormData({ ...formData, modelId: parseInt(value, 10) })}
                                disabled={loading || loadingModels}
                            >
                                <SelectTrigger id="modelId">
                                    <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.map((model) => (
                                        <SelectItem key={model.modelId} value={model.modelId.toString()}>
                                            {model.providerName || `Provider ${model.providerId}`} - {model.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="requestPerMinute">
                                Requests Per Minute <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="requestPerMinute"
                                type="number"
                                min="1"
                                value={formData.requestPerMinute}
                                onChange={(e) => setFormData({ ...formData, requestPerMinute: parseInt(e.target.value, 10) || 0 })}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requestPerDay">
                                Requests Per Day <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="requestPerDay"
                                type="number"
                                min="1"
                                value={formData.requestPerDay}
                                onChange={(e) => setFormData({ ...formData, requestPerDay: parseInt(e.target.value, 10) || 0 })}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

