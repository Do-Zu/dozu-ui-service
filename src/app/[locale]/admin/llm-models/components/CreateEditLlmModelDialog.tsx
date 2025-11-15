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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { CreateLlmModelInput, UpdateLlmModelInput, LlmModel } from '@/types/llm-admin/llmModel';
import { LlmProvider, LlmProvidersResponse } from '@/types/llm-admin/llmProvider';
import errorHelper from '@/utils/error.helper';
import { getProviderColor } from '@/utils/providerColors';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';

interface CreateEditLlmModelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    model?: LlmModel | null;
}

export function CreateEditLlmModelDialog({
    open,
    onOpenChange,
    onSuccess,
    model,
}: CreateEditLlmModelDialogProps) {
    const [formData, setFormData] = useState<CreateLlmModelInput>({
        providerId: 0,
        name: '',
        priority: 0,
        isAvailable: true,
        isDefault: false,
        description: '',
    });
    const [providers, setProviders] = useState<LlmProvider[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(false);

    const isEditMode = !!model;

    // Fetch providers on mount
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                setLoadingProviders(true);
                const response: ApiResponse<LlmProvidersResponse> = await getRequest<unknown, LlmProvidersResponse>(
                    '/admin/llm-providers?limit=100'
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

    // Initialize form data when model changes
    useEffect(() => {
        if (model) {
            setFormData({
                providerId: model.providerId,
                name: model.name,
                priority: model.priority,
                isAvailable: model.isAvailable,
                isDefault: model.isDefault,
                description: model.description || '',
            });
        } else {
            resetForm();
        }
    }, [model]);

    const resetForm = () => {
        setFormData({
            providerId: 0,
            name: '',
            priority: 0,
            isAvailable: true,
            isDefault: false,
            description: '',
        });
    };

    const { execute: createModel, loading: createLoading } = usePost(
        '/admin/llm-models',
        'POST',
        {
            onError: (error) => {
                const errorMessage = errorHelper.getErrorMessage(error);
                toast({
                    description: errorMessage || 'Failed to create model',
                    variant: 'destructive',
                });
            },
            onMessageSuccess: () => {
                toast({ description: 'Model created successfully' });
                onSuccess();
            },
        }
    );

    const { execute: updateModel, loading: updateLoading } = usePost(
        `/admin/llm-models/${model?.modelId}`,
        'PATCH',
        {
            onError: (error) => {
                const errorMessage = errorHelper.getErrorMessage(error);
                toast({
                    description: errorMessage || 'Failed to update model',
                    variant: 'destructive',
                });
            },
            onMessageSuccess: () => {
                toast({ description: 'Model updated successfully' });
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

        // Verify selected provider exists and is available
        const selectedProvider = providers.find(p => p.providerId === formData.providerId);
        if (!selectedProvider) {
            toast({
                description: 'Selected provider not found',
                variant: 'destructive',
            });
            return;
        }

        if (!selectedProvider.isAvailable) {
            toast({
                description: 'Selected provider is not available. Please select an available provider.',
                variant: 'destructive',
            });
            return;
        }

        if (isEditMode) {
            const updateData: UpdateLlmModelInput = {
                providerId: formData.providerId,
                name: formData.name,
                priority: formData.priority,
                isAvailable: formData.isAvailable,
                isDefault: formData.isDefault,
                description: formData.description || null,
            };
            await updateModel(updateData);
        } else {
            const createData: CreateLlmModelInput = {
                ...formData,
                description: formData.description || null,
            };
            await createModel(createData);
        }
    };

    const loading = createLoading || updateLoading;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit LLM Model' : 'Create New LLM Model'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the LLM model details and settings.'
                            : 'Add a new LLM model with provider, name, and configuration.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="providerId">Provider *</Label>
                            <Select
                                value={formData.providerId ? String(formData.providerId) : ''}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, providerId: parseInt(value) || 0 })
                                }
                                disabled={loadingProviders}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingProviders ? 'Loading providers...' : 'Select a provider'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {providers.length === 0 && !loadingProviders ? (
                                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                            No providers available
                                        </div>
                                    ) : (
                                        providers.map((provider) => {
                                            const colors = getProviderColor(provider.name);
                                            return (
                                                <SelectItem key={provider.providerId} value={String(provider.providerId)}>
                                                    <div className="flex items-center gap-2">
                                                        <span 
                                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                                                            style={{
                                                                background: `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientTo})`,
                                                            }}
                                                        >
                                                            {provider.name}
                                                        </span>
                                                        {provider.isDefault && (
                                                            <span className="text-xs text-muted-foreground">(Default)</span>
                                                        )}
                                                        {!provider.isAvailable && (
                                                            <span className="text-xs text-red-500">(Unavailable)</span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Select a provider from the list
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Model Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., gemini-2.5-flash"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description ?? ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe this model..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Input
                                id="priority"
                                type="number"
                                min="0"
                                value={formData.priority || 0}
                                onChange={(e) =>
                                    setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                                }
                            />
                            <p className="text-xs text-muted-foreground">Lower number = higher priority</p>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isAvailable"
                                checked={formData.isAvailable}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, isAvailable: checked })
                                }
                            />
                            <Label htmlFor="isAvailable">Available (model can be used)</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isDefault"
                                checked={formData.isDefault}
                                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                            />
                            <Label htmlFor="isDefault">
                                Default (can have multiple default models)
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update Model' : 'Create Model'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

