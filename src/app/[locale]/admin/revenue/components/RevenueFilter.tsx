'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Period } from '@/types/revenue';
import { PeriodSelector } from './PeriodSelector';
import { CalendarIcon, Search, X } from 'lucide-react';
import {
    format,
    startOfToday,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    subDays,
    subWeeks,
    subMonths,
    subYears,
    getWeek,
    getYear,
    addDays,
    addWeeks,
    addMonths,
    addYears,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Card, CardContent } from '@/components/ui/card';

export interface RevenueFilterData {
    period: Period;
    dateRange?: DateRange;
    yearRange?: { from: number; to: number };
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
        const newFilters = { ...filters, [key]: value };
        
        // Clear dateRange when switching to yearly period
        if (key === 'period' && value === 'year') {
            newFilters.dateRange = undefined;
        }
        
        // Clear yearRange when switching to non-yearly period
        if (key === 'period' && value !== 'year') {
            newFilters.yearRange = undefined;
        }
        
        onFiltersChange(newFilters);
    };

    const clearFilters = () => {
        onFiltersChange({
            period: filters.period,
            dateRange: undefined,
            yearRange: undefined,
        });
    };

    // Quick filter handlers
    const handleDailyQuickFilter = (preset: 'today' | 'yesterday' | 'last7' | 'last30') => {
        const today = startOfToday();
        let from: Date;
        let to: Date = today;

        switch (preset) {
            case 'today':
                from = today;
                break;
            case 'yesterday':
                from = subDays(today, 1);
                to = subDays(today, 1);
                break;
            case 'last7':
                from = subDays(today, 6);
                break;
            case 'last30':
                from = subDays(today, 29);
                break;
        }

        updateFilter('dateRange', { from, to });
        // Auto search when using quick filter
        setTimeout(() => {
            onSearch();
        }, 100);
    };

    const handleWeeklyQuickFilter = (preset: 'thisWeek' | 'lastWeek' | 'last4Weeks') => {
        const today = startOfToday();
        let weekStart: Date;
        let weekEnd: Date;

        switch (preset) {
            case 'thisWeek':
                weekStart = startOfWeek(today, { weekStartsOn: 1 });
                weekEnd = endOfWeek(today, { weekStartsOn: 1 });
                break;
            case 'lastWeek':
                const lastWeek = subWeeks(today, 1);
                weekStart = startOfWeek(lastWeek, { weekStartsOn: 1 });
                weekEnd = endOfWeek(lastWeek, { weekStartsOn: 1 });
                break;
            case 'last4Weeks':
                weekStart = startOfWeek(subWeeks(today, 3), { weekStartsOn: 1 });
                weekEnd = endOfWeek(today, { weekStartsOn: 1 });
                break;
        }

        updateFilter('dateRange', { from: weekStart, to: weekEnd });
    };

    const handleMonthlyQuickFilter = (preset: 'thisMonth' | 'lastMonth' | 'last6Months' | 'ytd') => {
        const today = startOfToday();
        let from: Date;
        let to: Date = today;

        switch (preset) {
            case 'thisMonth':
                from = startOfMonth(today);
                break;
            case 'lastMonth':
                const lastMonth = subMonths(today, 1);
                from = startOfMonth(lastMonth);
                to = endOfMonth(lastMonth);
                break;
            case 'last6Months':
                from = startOfMonth(subMonths(today, 5));
                break;
            case 'ytd':
                from = startOfYear(today);
                break;
        }

        updateFilter('dateRange', { from, to });
    };

    const handleYearlyQuickFilter = (preset: 'last3Years' | 'last5Years') => {
        const currentYear = getYear(startOfToday());
        let from: number;
        let to: number = currentYear;

        switch (preset) {
            case 'last3Years':
                from = currentYear - 2;
                break;
            case 'last5Years':
                from = currentYear - 4;
                break;
        }

        updateFilter('yearRange', { from, to });
    };

    // Get week number and range for display
    const getWeekDisplay = (date: Date | undefined) => {
        if (!date) return '';
        const weekNum = getWeek(date, { weekStartsOn: 1 });
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        return `Week ${weekNum} (${format(weekStart, 'dd/MM')} – ${format(weekEnd, 'dd/MM')})`;
    };

    const hasActiveFilters = 
        filters.dateRange?.from || 
        filters.dateRange?.to ||
        filters.yearRange?.from ||
        filters.yearRange?.to;

    const canSearch =
        filters.period === 'year'
            ? filters.yearRange?.from && filters.yearRange?.to
            : filters.dateRange?.from && filters.dateRange?.to;

    // Generate year options (last 10 years)
    const currentYear = getYear(startOfToday());
    const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

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

                        {/* Daily Period */}
                        {filters.period === 'day' && (
                            <>
                                {/* Quick Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Quick Filter</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDailyQuickFilter('today')}
                                        >
                                            Today
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDailyQuickFilter('yesterday')}
                                        >
                                            Yesterday
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDailyQuickFilter('last7')}
                                        >
                                            Last 7 days
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDailyQuickFilter('last30')}
                                        >
                                            Last 30 days
                                        </Button>
                                    </div>
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
                            </>
                        )}

                        {/* Weekly Period */}
                        {filters.period === 'week' && (
                            <>
                                {/* Quick Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Quick Select</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleWeeklyQuickFilter('thisWeek')}
                                        >
                                            This week
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleWeeklyQuickFilter('lastWeek')}
                                        >
                                            Last week
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleWeeklyQuickFilter('last4Weeks')}
                                        >
                                            Last 4 weeks
                                        </Button>
                                    </div>
                                </div>

                                {/* Week Picker */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Week Range</Label>
                                    <div className="flex items-center gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn(
                                                        'w-[200px] justify-start text-left font-normal',
                                                        !filters.dateRange?.from && 'text-muted-foreground'
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {filters.dateRange?.from ? (
                                                        getWeekDisplay(filters.dateRange.from) || 'Select week'
                                                    ) : (
                                                        <span>Select week</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={filters.dateRange?.from}
                                                    onSelect={(date) => {
                                                        if (!date) return;
                                                        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
                                                        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
                                                        updateFilter('dateRange', {
                                                            from: weekStart,
                                                            to: weekEnd,
                                                        });
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Monthly Period */}
                        {filters.period === 'month' && (
                            <>
                                {/* Quick Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Preset</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleMonthlyQuickFilter('thisMonth')}
                                        >
                                            This month
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleMonthlyQuickFilter('lastMonth')}
                                        >
                                            Last month
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleMonthlyQuickFilter('last6Months')}
                                        >
                                            Last 6 months
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleMonthlyQuickFilter('ytd')}
                                        >
                                            YTD
                                        </Button>
                                    </div>
                                </div>

                                {/* Month Range Picker */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Month Range</Label>
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
                                                        format(filters.dateRange.from, 'MM/yyyy')
                                                    ) : (
                                                        <span>From</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={filters.dateRange?.from}
                                                    onSelect={(date) => {
                                                        if (!date) return;
                                                        const monthStart = startOfMonth(date);
                                                        updateFilter('dateRange', {
                                                            ...filters.dateRange,
                                                            from: monthStart,
                                                        });
                                                    }}
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
                                                        format(filters.dateRange.to, 'MM/yyyy')
                                                    ) : (
                                                        <span>To</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={filters.dateRange?.to}
                                                    onSelect={(date) => {
                                                        if (!date) return;
                                                        const monthEnd = endOfMonth(date);
                                                        updateFilter('dateRange', {
                                                            ...filters.dateRange,
                                                            to: monthEnd,
                                                        });
                                                    }}
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
                            </>
                        )}

                        {/* Yearly Period */}
                        {filters.period === 'year' && (
                            <>
                                {/* Quick Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Preset</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleYearlyQuickFilter('last3Years')}
                                        >
                                            Last 3 years
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleYearlyQuickFilter('last5Years')}
                                        >
                                            Last 5 years
                                </Button>
                                    </div>
                                </div>

                                {/* Year Range Picker */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Year Range</Label>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={filters.yearRange?.from?.toString() || ''}
                                            onValueChange={(value) =>
                                                updateFilter('yearRange', {
                                                    ...filters.yearRange,
                                                    from: parseInt(value),
                                                })
                                            }
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="From" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {yearOptions.map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <span className="text-muted-foreground">→</span>

                                        <Select
                                            value={filters.yearRange?.to?.toString() || ''}
                                            onValueChange={(value) =>
                                                updateFilter('yearRange', {
                                                    ...filters.yearRange,
                                                    to: parseInt(value),
                                                })
                                            }
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="To" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {yearOptions.map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Search Button */}
                        <Button
                            onClick={onSearch}
                            size="sm"
                            className="gap-2"
                            disabled={!canSearch}
                        >
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

