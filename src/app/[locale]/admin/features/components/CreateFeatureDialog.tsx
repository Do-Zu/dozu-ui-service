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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { CreateFeatureInput, FeatureType, FeatureCategory, FeatureUnit } from '@/types/subscription';

interface CreateFeatureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateFeatureDialog({ open, onOpenChange, onSuccess }: CreateFeatureDialogProps) {
    const [formData, setFormData] = useState<CreateFeatureInput>({
        name: '',
        description: '',
        featureType: 'boolean',
        category: 'core',
        isActive: true,
        sortOrder: 0,
    });

    const { execute: createFeature, loading } = usePost('/admin/subscription/features', 'POST', {
        onMessageError: () => toast({ description: 'Failed to create feature', variant: 'destructive' }),
        onMessageSuccess: () => {
            toast({ description: 'Feature created successfully' });
            onSuccess();
            onOpenChange(false);
            resetForm();
        },
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            featureType: 'boolean',
            category: 'core',
            isActive: true,
            sortOrder: 0,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createFeature(formData);
    };

    const needsUnit = formData.featureType === 'usage' || formData.featureType === 'size_limit';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create New Feature</DialogTitle>
                    <DialogDescription>
                        Define a new feature that can be assigned to subscription plans.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Feature Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., AI Assistant Speed"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe this feature..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="featureType">Feature Type *</Label>
                            <Select
                                value={formData.featureType}
                                onValueChange={(value: FeatureType) => setFormData({ ...formData, featureType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="boolean">Boolean (On/Off)</SelectItem>
                                    <SelectItem value="usage">Usage Limit</SelectItem>
                                    <SelectItem value="size_limit">Size Limit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: FeatureCategory) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="core">Core</SelectItem>
                                    <SelectItem value="storage">Storage</SelectItem>
                                    <SelectItem value="integrations">Integrations</SelectItem>
                                    <SelectItem value="customization">Customization</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {needsUnit && (
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Select
                                value={formData.unit}
                                onValueChange={(value: FeatureUnit) => setFormData({ ...formData, unit: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="count">Count</SelectItem>
                                    <SelectItem value="MB">MB</SelectItem>
                                    <SelectItem value="GB">GB</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sortOrder">Sort Order</Label>
                            <Input
                                id="sortOrder"
                                type="number"
                                value={formData.sortOrder}
                                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="flex items-center space-x-2 mt-8">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Feature'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

