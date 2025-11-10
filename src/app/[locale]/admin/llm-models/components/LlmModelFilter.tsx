'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GetLlmModelsQuery } from '@/types/llmModel';
import { X } from 'lucide-react';

interface LlmModelFilterProps {
    onFilterChange: (filters: GetLlmModelsQuery) => void;
}

export function LlmModelFilter({ onFilterChange }: LlmModelFilterProps) {
    const [filters, setFilters] = useState<GetLlmModelsQuery>({
        providerId: '',
        isAvailable: '',
        isDefault: '',
        search: '',
    });

    const handleFilterChange = (key: keyof GetLlmModelsQuery, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters: GetLlmModelsQuery = {
            providerId: '',
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
                        <Label htmlFor="providerId">Provider ID</Label>
                        <Input
                            id="providerId"
                            type="number"
                            placeholder="Filter by provider ID"
                            value={filters.providerId || ''}
                            onChange={(e) => handleFilterChange('providerId', e.target.value)}
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
                                <SelectItem value="true">Available</SelectItem>
                                <SelectItem value="false">Unavailable</SelectItem>
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
                                <SelectItem value="true">Default</SelectItem>
                                <SelectItem value="false">Not Default</SelectItem>
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

