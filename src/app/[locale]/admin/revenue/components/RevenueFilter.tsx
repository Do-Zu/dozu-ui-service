'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Period } from '@/types/revenue';
import { PeriodSelector } from './PeriodSelector';
import { CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Card, CardContent } from '@/components/ui/card';

export interface RevenueFilterData {
    period: Period;
    dateRange?: DateRange;
    subscriptionPlan?: string;
    paymentGateway?: string;
    minRevenue?: number;
    maxRevenue?: number;
}

interface RevenueFilterProps {
    filters: RevenueFilterData;
    onFiltersChange: (filters: RevenueFilterData) => void;
    onSearch: () => void;
}

export function RevenueFilter({
    filters,
    onFiltersChange,
    onSearch,
}: RevenueFilterProps) {
    const updateFilter = (key: keyof RevenueFilterData, value: any) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFiltersChange({
            period: filters.period,
            dateRange: undefined,
        });
    };

    const hasActiveFilters = filters.dateRange?.from || filters.dateRange?.to;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Main Filters Row */}
                    <div className="flex flex-wrap items-end gap-4">
                        {/* Granularity */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Granularity</Label>
                            <PeriodSelector
                                selected={filters.period}
                                onChange={(period) => updateFilter('period', period)}
                            />
                        </div>

                        {/* Date Range Picker */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Date Range</Label>
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                'w-[140px] justify-start text-left font-normal',
                                                !filters.dateRange?.from && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.dateRange?.from ? (
                                                format(filters.dateRange.from, 'MMM dd, y')
                                            ) : (
                                                <span>From</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={filters.dateRange?.from}
                                            onSelect={(date) =>
                                                updateFilter('dateRange', {
                                                    ...filters.dateRange,
                                                    from: date,
                                                })
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <span className="text-muted-foreground">→</span>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                'w-[140px] justify-start text-left font-normal',
                                                !filters.dateRange?.to && 'text-muted-foreground'
                                            )}
                                            disabled={!filters.dateRange?.from}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.dateRange?.to ? (
                                                format(filters.dateRange.to, 'MMM dd, y')
                                            ) : (
                                                <span>To</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={filters.dateRange?.to}
                                            onSelect={(date) =>
                                                updateFilter('dateRange', {
                                                    ...filters.dateRange,
                                                    to: date,
                                                })
                                            }
                                            disabled={(date) =>
                                                filters.dateRange?.from
                                                    ? date < filters.dateRange.from
                                                    : false
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Search Button */}
                        <Button onClick={onSearch} size="sm" className="gap-2">
                            <Search className="h-4 w-4" />
                            Search
                        </Button>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

