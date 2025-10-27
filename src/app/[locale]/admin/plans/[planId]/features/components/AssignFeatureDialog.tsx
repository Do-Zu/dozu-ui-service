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
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { Feature, AssignFeatureToPlanInput, FeatureInterval } from '@/types/subscription';

interface AssignFeatureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    planId: number;
    onSuccess: () => void;
}

export function AssignFeatureDialog({ open, onOpenChange, planId, onSuccess }: AssignFeatureDialogProps) {
    const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([]);
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

    const [formData, setFormData] = useState<Partial<AssignFeatureToPlanInput>>({
        planId,
        featureId: 0,
        interval: 'monthly',
        apiUrl: '',
        isUnlimited: false,
        isEnabled: true,
    });

    useEffect(() => {
        if (open) {
            fetchAvailableFeatures();
        }
    }, [open]);

    const fetchAvailableFeatures = async () => {
        try {
            const response: ApiResponse<Feature[]> = await getRequest('/admin/subscription/features');
            setAvailableFeatures(response.data || []);
        } catch (error) {
            toast({ description: 'Failed to load features', variant: 'destructive' });
        }
    };

    const { execute: assignFeature, loading } = usePost('/admin/subscription/plan-features', 'POST', {
        onMessageError: () => toast({ description: 'Failed to assign feature', variant: 'destructive' }),
        onMessageSuccess: () => {
            toast({ description: 'Feature assigned successfully' });
            onSuccess();
            onOpenChange(false);
            resetForm();
        },
    });

    const resetForm = () => {
        setFormData({
            planId,
            featureId: 0,
            interval: 'monthly',
            apiUrl: '',
            isUnlimited: false,
            isEnabled: true,
        });
        setSelectedFeature(null);
    };

    const handleFeatureSelect = (featureId: string) => {
        const feature = availableFeatures.find((f) => f.featureId === parseInt(featureId));
        setSelectedFeature(feature || null);
        setFormData({ ...formData, featureId: parseInt(featureId) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.featureId || !formData.apiUrl) {
            toast({ description: 'Please fill all required fields', variant: 'destructive' });
            return;
        }
        await assignFeature(formData as AssignFeatureToPlanInput);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Assign Feature to Plan</DialogTitle>
                    <DialogDescription>
                        Add a feature to this plan with specific limits and configuration.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="feature">Feature *</Label>
                        <Select value={formData.featureId?.toString()} onValueChange={handleFeatureSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a feature" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableFeatures.map((feature) => (
                                    <SelectItem key={feature.featureId} value={feature.featureId.toString()}>
                                        {feature.name} ({feature.featureType})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedFeature?.description && (
                            <p className="text-sm text-muted-foreground">{selectedFeature.description}</p>
                        )}
                    </div>

                    {selectedFeature && selectedFeature.featureType === 'boolean' && (
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="booleanValue"
                                checked={formData.booleanValue || false}
                                onCheckedChange={(checked) => setFormData({ ...formData, booleanValue: checked })}
                            />
                            <Label htmlFor="booleanValue">Enable this feature</Label>
                        </div>
                    )}

                    {selectedFeature && (selectedFeature.featureType === 'usage' || selectedFeature.featureType === 'size_limit') && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="numericValue">Limit Value</Label>
                                <Input
                                    id="numericValue"
                                    type="number"
                                    step="0.01"
                                    value={formData.numericValue || ''}
                                    onChange={(e) => setFormData({ ...formData, numericValue: e.target.value })}
                                    placeholder="e.g., 100"
                                    disabled={formData.isUnlimited}
                                />
                            </div>

                            <div className="flex items-center space-x-2 mt-8">
                                <Switch
                                    id="isUnlimited"
                                    checked={formData.isUnlimited || false}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, isUnlimited: checked, numericValue: checked ? undefined : formData.numericValue })
                                    }
                                />
                                <Label htmlFor="isUnlimited">Unlimited</Label>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="interval">Reset Interval *</Label>
                            <Select
                                value={formData.interval}
                                onValueChange={(value: FeatureInterval) => setFormData({ ...formData, interval: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                    <SelectItem value="lifetime">Lifetime</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2 mt-8">
                            <Switch
                                id="isEnabled"
                                checked={formData.isEnabled || false}
                                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
                            />
                            <Label htmlFor="isEnabled">Enabled</Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="apiUrl">API URL *</Label>
                        <Input
                            id="apiUrl"
                            type="url"
                            value={formData.apiUrl}
                            onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                            placeholder="https://api.example.com/feature"
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            API endpoint for checking/consuming this feature
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !formData.featureId}>
                            {loading ? 'Assigning...' : 'Assign Feature'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

