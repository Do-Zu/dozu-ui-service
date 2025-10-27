'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface PaymentFilterProps {
    onFilterChange: (filters: Record<string, string>) => void;
}

export function PaymentFilter({ onFilterChange }: PaymentFilterProps) {
    const [status, setStatus] = useState('');
    const [gateway, setGateway] = useState('');
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleApply = () => {
        const filters: Record<string, string> = {};
        
        if (status && status !== 'all') filters.status = status;
        if (gateway && gateway !== 'all') filters.gateway = gateway;
        if (search) filters.search = search;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        onFilterChange(filters);
    };

    const handleReset = () => {
        setStatus('');
        setGateway('');
        setSearch('');
        setStartDate('');
        setEndDate('');
        onFilterChange({});
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Gateway</label>
                    <Select value={gateway} onValueChange={setGateway}>
                        <SelectTrigger>
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="stripe">Stripe</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="momo">Momo</SelectItem>
                            <SelectItem value="payos">PayOS</SelectItem>
                            <SelectItem value="sepay">Sepay</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Search</label>
                    <Input
                        placeholder="Code, Email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <Button onClick={handleApply}>Apply Filters</Button>
                <Button variant="outline" onClick={handleReset}>
                    Reset
                </Button>
            </div>
        </div>
    );
}

