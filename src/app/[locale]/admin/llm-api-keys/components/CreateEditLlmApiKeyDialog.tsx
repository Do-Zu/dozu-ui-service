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
import { Switch } from '@/components/ui/switch';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { CreateLlmApiKeyInput, UpdateLlmApiKeyInput, LlmApiKey } from '@/types/llm-admin/llmApiKey';
import { LlmProvider, LlmProvidersResponse } from '@/types/llm-admin/llmProvider';
import errorHelper from '@/utils/error.helper';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { ROUTES } from '@/utils/constants/routes';

interface CreateEditLlmApiKeyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    apiKey?: LlmApiKey | null;
}

export function CreateEditLlmApiKeyDialog({
    open,
    onOpenChange,
    onSuccess,
    apiKey,
}: CreateEditLlmApiKeyDialogProps) {
    const [formData, setFormData] = useState<CreateLlmApiKeyInput & { index?: number }>({
        providerId: 0,
        isDefault: false,
        priority: 0,
        index: 0,
        keyValue: '',
        keyType: 'free',
        status: 'active',
        usageLimitPerDay: null,
    });
    const [providers, setProviders] = useState<LlmProvider[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(false);

    const isEditMode = !!apiKey;

    // Fetch providers on mount
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                setLoadingProviders(true);
                const response: ApiResponse<LlmProvidersResponse> = await getRequest<unknown, LlmProvidersResponse>(
                    ROUTES.LLM_PROVIDERS_LIST_ALL
                );
                setProviders(response.data?.providers || []);
            } catch (error) {
                console.error('Failed to fetch providers:', error);
                toast({
                    description: 'Failed to load providers list',
                    variant: 'destructive',
                });
            } finally {
                setLoadingProviders(false);
            }
        };

        if (open) {
            fetchProviders();
        }
    }, [open]);

    // Initialize form data when apiKey changes
    useEffect(() => {
        if (apiKey) {
            setFormData({
                providerId: apiKey.providerId,
                isDefault: apiKey.isDefault,
                priority: apiKey.priority,
                index: apiKey.index,
                keyValue: apiKey.keyValue,
                keyType: apiKey.keyType,
                status: apiKey.status,
                usageLimitPerDay: apiKey.usageLimitPerDay,
            });
        } else {
            resetForm();
        }
    }, [apiKey]);

    const resetForm = () => {
        setFormData({
            providerId: 0,
            isDefault: false,
            priority: 0,
            index: 0,
            keyValue: '',
            keyType: 'free',
            status: 'active',
            usageLimitPerDay: null,
        });
    };

    const { execute: createApiKey, loading: createLoading } = usePost(
        ROUTES.LLM_API_KEYS_CREATE,
        'POST',
        {
            onError: (error) => {
                const errorMessage = errorHelper.getErrorMessage(error);
                toast({
                    description: errorMessage || 'Failed to create API key',
                    variant: 'destructive',
                });
            },
            onMessageSuccess: () => {
                toast({ description: 'API key created successfully' });
                onSuccess();
            },
        }
    );

    const { execute: updateApiKey, loading: updateLoading } = usePost(
        ROUTES.LLM_API_KEYS_UPDATE(apiKey?.keyId || 0),
        'PATCH',
        {
            onError: (error) => {
                const errorMessage = errorHelper.getErrorMessage(error);
                toast({
                    description: errorMessage || 'Failed to update API key',
                    variant: 'destructive',
                });
            },
            onMessageSuccess: () => {
                toast({ description: 'API key updated successfully' });
                onSuccess();
            },
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.providerId || formData.providerId === 0) {
            toast({
                description: 'Please select a provider',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.keyValue.trim()) {
            toast({
                description: 'Please enter an API key value',
                variant: 'destructive',
            });
            return;
        }

        if (isEditMode) {
            const updatePayload: UpdateLlmApiKeyInput = {
                providerId: formData.providerId,
                isDefault: formData.isDefault,
                priority: formData.priority,
                index: formData.index,
                keyValue: formData.keyValue,
                keyType: formData.keyType,
                status: formData.status,
                usageLimitPerDay: formData.usageLimitPerDay,
            };
            await updateApiKey(updatePayload);
        } else {
            const createPayload: CreateLlmApiKeyInput = {
                providerId: formData.providerId,
                isDefault: formData.isDefault,
                priority: formData.priority,
                index: formData.index || 0,
                keyValue: formData.keyValue,
                keyType: formData.keyType,
                status: formData.status,
                usageLimitPerDay: formData.usageLimitPerDay,
            };
            await createApiKey(createPayload);
        }
    };

    const loading = createLoading || updateLoading;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit API Key' : 'Create API Key'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the API key information below.'
                            : 'Fill in the details to create a new API key for an LLM provider.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="providerId">
                            Provider <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.providerId.toString()}
                            onValueChange={(value) => setFormData({ ...formData, providerId: parseInt(value, 10) })}
                            disabled={loading || loadingProviders}
                        >
                            <SelectTrigger id="providerId">
                                <SelectValue placeholder="Select a provider" />
                            </SelectTrigger>
                            <SelectContent>
                                {providers.map((provider) => (
                                    <SelectItem key={provider.providerId} value={provider.providerId.toString()}>
                                        {provider.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="keyValue">
                            API Key Value <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="keyValue"
                            type="password"
                            value={formData.keyValue}
                            onChange={(e) => setFormData({ ...formData, keyValue: e.target.value })}
                            placeholder="Enter API key value"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="keyType">Key Type</Label>
                            <Select
                                value={formData.keyType}
                                onValueChange={(value: 'free' | 'paid') =>
                                    setFormData({ ...formData, keyType: value })
                                }
                                disabled={loading}
                            >
                                <SelectTrigger id="keyType">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: 'active' | 'inactive' | 'expired' | 'rate_limited') =>
                                    setFormData({ ...formData, status: value })
                                }
                                disabled={loading}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="rate_limited">Rate Limited</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Input
                                id="priority"
                                type="number"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value, 10) || 0 })}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="index">Index</Label>
                            <Input
                                id="index"
                                type="number"
                                value={formData.index}
                                onChange={(e) => setFormData({ ...formData, index: parseInt(e.target.value, 10) || 0 })}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="usageLimitPerDay">Usage Limit/Day</Label>
                            <Input
                                id="usageLimitPerDay"
                                type="number"
                                value={formData.usageLimitPerDay || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        usageLimitPerDay: e.target.value ? parseInt(e.target.value, 10) : null,
                                    })
                                }
                                placeholder="Unlimited"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isDefault"
                            checked={formData.isDefault}
                            onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                            disabled={loading}
                        />
                        <Label htmlFor="isDefault" className="cursor-pointer">
                            Set as default API key
                        </Label>
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

