'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { withAuth } from '@/hoc/withAuth';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { SubscriptionsResponse } from '@/types/subscriptionStats';
import { DataTable } from '@/components/ui/data-table';
import { getSubscriptionColumns } from './components/Columns';
import { SubscriptionFilter } from './components/SubscriptionFilter';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function SubscriptionListPage() {
    const searchParams = useSearchParams();
    const [subscriptions, setSubscriptions] = useState<SubscriptionsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});

    const fetchSubscriptions = useCallback(
        async (params = filters) => {
            try {
                setLoading(true);
                setError(null);

                // Merge URL params with filter params
                const urlParams = Object.fromEntries(searchParams.entries());
                const allParams = { ...params, ...urlParams };

                const query = new URLSearchParams(allParams).toString();
                const url = query ? `/admin/subscription/subscriptions?${query}` : `/admin/subscription/subscriptions`;

                const response: ApiResponse<SubscriptionsResponse> = await getRequest(url);
                setSubscriptions(response.data || null);
            } catch (err: any) {
                setError(err.message || 'An error occurred while retrieving subscriptions.');
            } finally {
                setLoading(false);
            }
        },
        [filters, searchParams]
    );

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const handleFilterChange = (newFilters: Record<string, string>) => {
        setFilters(newFilters);
        fetchSubscriptions(newFilters);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Link href="/admin/subscriptions">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight">Subscription Management</h2>
                    <p className="text-muted-foreground">
                        Track and manage all user subscriptions and upgrades
                    </p>
                </div>
            </div>

            <SubscriptionFilter onFilterChange={handleFilterChange} />

            <DataTable
                columns={getSubscriptionColumns()}
                data={subscriptions?.subscriptions || []}
                loading={loading}
                error={error}
                title={`Subscriptions (${subscriptions?.total || 0})`}
            />

            {subscriptions && subscriptions.total > subscriptions.limit && (
                <div className="flex items-center justify-center gap-2 py-4">
                    <span className="text-sm text-muted-foreground">
                        Page {subscriptions.page} of {Math.ceil(subscriptions.total / subscriptions.limit)}
                    </span>
                </div>
            )}
        </div>
    );
}

export default withAuth(SubscriptionListPage, {
    requiredRole: 'admin',
});

