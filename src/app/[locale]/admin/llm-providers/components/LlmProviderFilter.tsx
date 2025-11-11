'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GetLlmProvidersQuery } from '@/types/llmProvider';
import { X } from 'lucide-react';

interface LlmProviderFilterProps {
    onFilterChange: (filters: GetLlmProvidersQuery) => void;
}

export function LlmProviderFilter({ onFilterChange }: LlmProviderFilterProps) {
    const [filters, setFilters] = useState<GetLlmProvidersQuery>({
        isAvailable: '',
        isDefault: '',
        search: '',
    });

    const handleFilterChange = (key: keyof GetLlmProvidersQuery, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters: GetLlmProvidersQuery = {
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

