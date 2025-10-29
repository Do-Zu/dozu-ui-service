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
import { PeriodSelector } from './components/PeriodSelector';

function RevenueDashboardPage() {
    const [stats, setStats] = useState<RevenueStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<Period>('month');

    const fetchStats = useCallback(async (selectedPeriod: Period) => {
        try {
            setLoading(true);
            setError(null);

            const query = new URLSearchParams({ period: selectedPeriod }).toString();
            const response: ApiResponse<RevenueStats> = await getRequest(`/admin/revenue/stats?${query}`);
            setStats(response.data || null);
        } catch (err: any) {
            setError(err.message || 'An error occurred while retrieving revenue statistics.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats(period);
    }, [period, fetchStats]);

    const handlePeriodChange = (newPeriod: Period) => {
        setPeriod(newPeriod);
    };

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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Revenue Analytics</h2>
                    <p className="text-muted-foreground">Track revenue, growth, and key financial metrics</p>
                </div>
                <PeriodSelector selected={period} onChange={handlePeriodChange} />
            </div>

            {/* Key KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    description={`${stats.transactionCount} transactions`}
                    icon={<DollarSign className="h-4 w-4 text-green-600" />}
                    trend={stats.growthRate > 0 ? `+${stats.growthRate}%` : `${stats.growthRate}%`}
                    trendUp={stats.growthRate > 0}
                />
                <KPICard
                    title="MRR"
                    value={`$${stats.mrr.toLocaleString()}`}
                    description="Monthly Recurring Revenue"
                    icon={<CreditCard className="h-4 w-4 text-blue-600" />}
                    subtitle="Active subscriptions"
                />
                <KPICard
                    title="ARPU"
                    value={`$${stats.arpu.toLocaleString()}`}
                    description="Average Revenue Per User"
                    icon={<Users className="h-4 w-4 text-purple-600" />}
                    subtitle={`${stats.activeProUsers} Pro users`}
                />
                <KPICard
                    title="LTV"
                    value={`$${stats.ltv.toLocaleString()}`}
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
                        Revenue growth over time by {period}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RevenueTrendChart data={stats.revenueTrend} period={period} />
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
                            ${stats.averageTransactionValue.toLocaleString()}
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

