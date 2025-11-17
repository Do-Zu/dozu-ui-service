'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Period } from '@/types/revenue';
import { PeriodSelector } from './PeriodSelector';
import { CalendarIcon, ChevronDown, Search, X } from 'lucide-react';
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
    subscriptionPlans?: { value: string; label: string }[];
    paymentGateways?: { value: string; label: string }[];
}

export function RevenueFilter({
    filters,
    onFiltersChange,
    onSearch,
    subscriptionPlans = [],
    paymentGateways = [],
}: RevenueFilterProps) {
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    const updateFilter = (key: keyof RevenueFilterData, value: any) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFiltersChange({
            period: filters.period,
            dateRange: undefined,
            subscriptionPlan: undefined,
            paymentGateway: undefined,
            minRevenue: undefined,
            maxRevenue: undefined,
        });
    };

    const hasActiveFilters = 
        filters.dateRange?.from || 
        filters.subscriptionPlan || 
        filters.paymentGateway || 
        filters.minRevenue || 
        filters.maxRevenue;

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

                        {/* Advanced Filters Toggle */}
                        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                            <CollapsibleTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    Advanced Filters
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 transition-transform',
                                            isAdvancedOpen && 'rotate-180'
                                        )}
                                    />
                                </Button>
                            </CollapsibleTrigger>
                        </Collapsible>

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

                    {/* Advanced Filters Content */}
                    <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                        <CollapsibleContent>
                            <div className="pt-4 border-t space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Subscription Plan */}
                                    <div className="space-y-2">
                                        <Label htmlFor="subscriptionPlan" className="text-sm font-medium">
                                            Subscription Plan
                                        </Label>
                                        <Select
                                            value={filters.subscriptionPlan || 'all'}
                                            onValueChange={(value) =>
                                                updateFilter('subscriptionPlan', value === 'all' ? undefined : value)
                                            }
                                        >
                                            <SelectTrigger id="subscriptionPlan">
                                                <SelectValue placeholder="All Plans" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Plans</SelectItem>
                                                {subscriptionPlans.map((plan) => (
                                                    <SelectItem key={plan.value} value={plan.value}>
                                                        {plan.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Payment Gateway */}
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentGateway" className="text-sm font-medium">
                                            Payment Gateway
                                        </Label>
                                        <Select
                                            value={filters.paymentGateway || 'all'}
                                            onValueChange={(value) =>
                                                updateFilter('paymentGateway', value === 'all' ? undefined : value)
                                            }
                                        >
                                            <SelectTrigger id="paymentGateway">
                                                <SelectValue placeholder="All Gateways" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Gateways</SelectItem>
                                                {paymentGateways.map((gateway) => (
                                                    <SelectItem key={gateway.value} value={gateway.value}>
                                                        {gateway.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Revenue Range */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Revenue Range (VND)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Min"
                                                min="0"
                                                step="1000"
                                                value={filters.minRevenue || ''}
                                                onChange={(e) =>
                                                    updateFilter(
                                                        'minRevenue',
                                                        e.target.value ? Number(e.target.value) : undefined
                                                    )
                                                }
                                                className="w-full"
                                            />
                                            <span className="text-muted-foreground">-</span>
                                            <Input
                                                type="number"
                                                placeholder="Max"
                                                min="0"
                                                step="1000"
                                                value={filters.maxRevenue || ''}
                                                onChange={(e) =>
                                                    updateFilter(
                                                        'maxRevenue',
                                                        e.target.value ? Number(e.target.value) : undefined
                                                    )
                                                }
                                                className="w-full"
                                            />
                                        </div>
                                        {filters.minRevenue !== undefined &&
                                            filters.maxRevenue !== undefined &&
                                            filters.minRevenue > filters.maxRevenue && (
                                                <p className="text-xs text-destructive">
                                                    Min revenue must be less than max revenue
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </CardContent>
        </Card>
    );
}

