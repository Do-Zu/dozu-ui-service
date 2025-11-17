'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GetLlmModelsQuery } from '@/types/llm-admin/llmModel';
import { LlmProvider, LlmProvidersResponse } from '@/types/llm-admin/llmProvider';
import { X } from 'lucide-react';
import { getProviderColor } from '@/utils/providerColors';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { toast } from '@/hooks/use-toast';
import { ROUTES } from '@/utils/constants/routes';

interface LlmModelFilterProps {
    onFilterChange: (filters: GetLlmModelsQuery) => void;
}

export function LlmModelFilter({ onFilterChange }: LlmModelFilterProps) {
    const [filters, setFilters] = useState<GetLlmModelsQuery>({
        providerName: '',
        isAvailable: '',
        isDefault: '',
        search: '',
    });
    const [providers, setProviders] = useState<LlmProvider[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(false);

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

        fetchProviders();
    }, []);

    const handleFilterChange = (key: keyof GetLlmModelsQuery, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters: GetLlmModelsQuery = {
            providerName: '',
            isAvailable: '',
            isDefault: '',
            search: '',
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const hasActiveFilters = Object.values(filters).some((value) => value !== '');

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="search">Search</Label>
                        <Input
                            id="search"
                            placeholder="Search by name or description..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="providerName">Provider</Label>
                        <Select
                            value={filters.providerName || 'all'}
                            onValueChange={(value) => {
                                const filterValue = value === 'all' ? '' : value;
                                handleFilterChange('providerName', filterValue);
                            }}
                            disabled={loadingProviders}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={loadingProviders ? 'Loading providers...' : 'All Providers'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Providers</SelectItem>
                                {providers.map((provider) => {
                                    const colors = getProviderColor(provider.name);
                                    return (
                                        <SelectItem key={provider.providerId} value={provider.name}>
                                            <div className="flex items-center gap-2">
                                                <span 
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                                                    style={{
                                                        background: `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientTo})`,
                                                    }}
                                                >
                                                    {provider.name}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="isAvailable">Availability</Label>
                        <Select
                            value={filters.isAvailable || 'all'}
                            onValueChange={(value) => {
                                const filterValue = value === 'all' ? '' : value;
                                handleFilterChange('isAvailable', filterValue);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="true">
                                    <div className="flex items-center gap-2">
                                        <span 
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                                            style={{
                                                background: '#22c55e',
                                            }}
                                        >
                                            Available
                                        </span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="false">
                                    <div className="flex items-center gap-2">
                                        <span 
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                                            style={{
                                                background: '#ef4444',
                                            }}
                                        >
                                            Unavailable
                                        </span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="isDefault">Default Status</Label>
                        <Select
                            value={filters.isDefault || 'all'}
                            onValueChange={(value) => {
                                const filterValue = value === 'all' ? '' : value;
                                handleFilterChange('isDefault', filterValue);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="true">
                                    <div className="flex items-center gap-2">
                                        <span 
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                                            style={{
                                                background: 'linear-gradient(to right, #2563eb, #9333ea)',
                                            }}
                                        >
                                            Default
                                        </span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="false">
                                    <div className="flex items-center gap-2">
                                        <span 
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                                            style={{
                                                background: '#6b7280',
                                            }}
                                        >
                                            Not Default
                                        </span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                            <X className="mr-2 h-4 w-4" />
                            Clear Filters
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

