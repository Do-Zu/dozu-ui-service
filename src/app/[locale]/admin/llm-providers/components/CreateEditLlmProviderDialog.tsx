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
import { Switch } from '@/components/ui/switch';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { CreateLlmProviderInput, UpdateLlmProviderInput, LlmProvider } from '@/types/llm-admin/llmProvider';
import errorHelper from '@/utils/error.helper';

interface CreateEditLlmProviderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    provider?: LlmProvider | null;
}

export function CreateEditLlmProviderDialog({
    open,
    onOpenChange,
    onSuccess,
    provider,
}: CreateEditLlmProviderDialogProps) {
    const [formData, setFormData] = useState<CreateLlmProviderInput & { index?: number }>({
        name: '',
        isAvailable: true,
        isDefault: false,
        description: '',
        baseUrl: '',
    });

    const isEditMode = !!provider;

    // Initialize form data when provider changes
    useEffect(() => {
        if (provider) {
            setFormData({
                name: provider.name,
                index: provider.index,
                isAvailable: provider.isAvailable,
                isDefault: provider.isDefault,
                description: provider.description || '',
                baseUrl: provider.baseUrl || '',
            });
        } else {
            resetForm();
        }
    }, [provider]);

    const resetForm = () => {
        setFormData({
            name: '',
            isAvailable: true,
            isDefault: false,
            description: '',
            baseUrl: '',
        });
    };

    const { execute: createProvider, loading: createLoading } = usePost(
        '/admin/llm-providers',
        'POST',
        {
            onError: (error) => {
                const errorMessage = errorHelper.getErrorMessage(error);
                toast({
                    description: errorMessage || 'Failed to create provider',
                    variant: 'destructive',
                });
            },
            onMessageSuccess: () => {
                toast({ description: 'Provider created successfully' });
                onSuccess();
            },
        }
    );

    const { execute: updateProvider, loading: updateLoading } = usePost(
        `/admin/llm-providers/${provider?.providerId}`,
        'PATCH',
        {
            onError: (error) => {
                const errorMessage = errorHelper.getErrorMessage(error);
                toast({
                    description: errorMessage || 'Failed to update provider',
                    variant: 'destructive',
                });
            },
            onMessageSuccess: () => {
                toast({ description: 'Provider updated successfully' });
                onSuccess();
            },
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast({
                description: 'Please enter a provider name',
                variant: 'destructive',
            });
            return;
        }

        if (isEditMode) {
            const updateData: UpdateLlmProviderInput = {
                name: formData.name,
                index: formData.index,
                isAvailable: formData.isAvailable,
                isDefault: formData.isDefault,
                description: formData.description || null,
                baseUrl: formData.baseUrl || null,
            };
            await updateProvider(updateData);
        } else {
            // Remove index from create payload - it will be auto-generated
            const { index, ...createData } = formData;
            await createProvider(createData);
        }
    };

    const loading = createLoading || updateLoading;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit LLM Provider' : 'Create New LLM Provider'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the LLM provider details and settings.'
                            : 'Add a new LLM provider with name, base URL, and configuration.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className={isEditMode ? 'grid grid-cols-2 gap-4' : ''}>
                        <div className="space-y-2">
                            <Label htmlFor="name">Provider Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Google Gemini"
                                required
                            />
                        </div>

                        {isEditMode && (
                            <div className="space-y-2">
                                <Label htmlFor="index">Index *</Label>
                                <Input
                                    id="index"
                                    type="number"
                                    min="0"
                                    value={formData.index || 0}
                                    onChange={(e) =>
                                        setFormData({ ...formData, index: parseInt(e.target.value) || 0 })
                                    }
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Display order (lower = higher priority)</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="baseUrl">Base URL</Label>
                        <Input
                            id="baseUrl"
                            type="url"
                            value={formData.baseUrl}
                            onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                            placeholder="https://api.example.com/v1/"
                        />
                        <p className="text-xs text-muted-foreground">API base URL for this provider</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description ?? ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe this provider..."
                            rows={3}
                        />
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
                            <Label htmlFor="isAvailable">Available (provider can be used)</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isDefault"
                                checked={formData.isDefault}
                                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                            />
                            <Label htmlFor="isDefault">
                                Default (can have multiple default providers)
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update Provider' : 'Create Provider'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

