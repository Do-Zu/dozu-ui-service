'use client';

import { useCallback, useEffect, useState } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { RevenueStats, Period } from '@/types/revenue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { KPICard } from './components/KPICard';
import { RevenueTrendChart } from './components/RevenueTrendChart';
import { RevenueByGatewayChart } from './components/RevenueByGatewayChart';
import { RevenueByPlanChart } from './components/RevenueByPlanChart';
import { RevenueFilter, RevenueFilterData } from './components/RevenueFilter';
import { formatVND } from '@/utils/formatters';
import { format } from 'date-fns';

function RevenueDashboardPage() {
    const [stats, setStats] = useState<RevenueStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<RevenueFilterData>({
        period: 'month',
    });

    const fetchStats = useCallback(async (filterData: RevenueFilterData) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({ period: filterData.period });

            // Add date range
            if (filterData.dateRange?.from && filterData.dateRange?.to) {
                params.append('startDate', format(filterData.dateRange.from, 'yyyy-MM-dd'));
                params.append('endDate', format(filterData.dateRange.to, 'yyyy-MM-dd'));
            }

            const query = params.toString();
            const response: ApiResponse<RevenueStats> = await getRequest(`/admin/revenue/stats?${query}`);
            setStats(response.data || null);
        } catch (err: any) {
            setError(err.message || 'An error occurred while retrieving revenue statistics.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleFiltersChange = (newFilters: RevenueFilterData) => {
        setFilters(newFilters);
    };

    const handleSearch = () => {
        // Validate date range
        if (filters.dateRange?.from && filters.dateRange?.to && filters.dateRange.from > filters.dateRange.to) {
            setError('Start date must be before end date');
            return;
        }

        fetchStats(filters);
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchStats(filters);
    }, []); // Only on mount, search button triggers subsequent fetches

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading revenue statistics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-destructive">Error: {error}</div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Revenue Analytics</h2>
                <p className="text-muted-foreground">Track revenue, growth, and key financial metrics</p>
            </div>

            {/* Filter Section */}
            <RevenueFilter
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
            />

            {/* Key KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Revenue"
                    value={formatVND(stats.totalRevenue)}
                    description={`${stats.transactionCount} transactions`}
                    icon={<DollarSign className="h-4 w-4 text-green-600" />}
                    trend={stats.growthRate > 0 ? `+${stats.growthRate}%` : `${stats.growthRate}%`}
                    trendUp={stats.growthRate > 0}
                />
                <KPICard
                    title="MRR"
                    value={formatVND(stats.mrr)}
                    description="Monthly Recurring Revenue"
                    icon={<CreditCard className="h-4 w-4 text-blue-600" />}
                    subtitle="Active subscriptions"
                />
                <KPICard
                    title="ARPU"
                    value={formatVND(stats.arpu)}
                    description="Average Revenue Per User"
                    icon={<Users className="h-4 w-4 text-purple-600" />}
                    subtitle={`${stats.activeProUsers} Pro users`}
                />
                <KPICard
                    title="LTV"
                    value={formatVND(stats.ltv)}
                    description="Customer Lifetime Value"
                    icon={<TrendingUp className="h-4 w-4 text-orange-600" />}
                    subtitle="Projected value"
                />
            </div>

            {/* Revenue Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>
                        Revenue growth over time by {filters.period}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RevenueTrendChart data={stats.revenueTrend} period={filters.period} />
                </CardContent>
            </Card>

            {/* Breakdown Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue by Payment Gateway</CardTitle>
                        <CardDescription>Distribution across payment providers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RevenueByGatewayChart data={stats.revenueByGateway} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Revenue by Subscription Plan</CardTitle>
                        <CardDescription>Active subscriptions contribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RevenueByPlanChart data={stats.revenueByPlan} />
                    </CardContent>
                </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Average Transaction
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatVND(stats.averageTransactionValue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Growth Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.growthRate > 0 ? '+' : ''}{stats.growthRate.toFixed(2)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">vs previous period</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Pro Subscriptions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeProUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">Paying customers</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default withAuth(RevenueDashboardPage, {
    requiredRole: 'admin',
});

