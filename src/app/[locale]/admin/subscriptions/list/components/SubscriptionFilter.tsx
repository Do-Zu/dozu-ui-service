'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface SubscriptionFilterProps {
    onFilterChange: (filters: Record<string, string>) => void;
}

export function SubscriptionFilter({ onFilterChange }: SubscriptionFilterProps) {
    const [status, setStatus] = useState('');
    const [planType, setPlanType] = useState('');

    const handleApply = () => {
        const filters = {
            ...(status !== 'all' && status !== '' ? { status } : {}),
            ...(planType !== 'all' && planType !== '' ? { planType } : {}),
        };

        onFilterChange(filters);
    };

    const handleReset = () => {
        setStatus('');
        setPlanType('');
        onFilterChange({});
    };

    return (
        <div className="flex items-end gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trialing">Trial</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Plan Type</label>
                <Select value={planType} onValueChange={setPlanType}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={handleApply}>Filter</Button>
            <Button variant="outline" onClick={handleReset}>
                Reset
            </Button>
        </div>
    );
}

