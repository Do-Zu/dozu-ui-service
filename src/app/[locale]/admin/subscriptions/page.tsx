'use client';

import { useCallback, useEffect, useState } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { SubscriptionStats } from '@/types/subscriptionStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Calendar, Award } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { StatusBreakdownChart } from './components/StatusBreakdownChart';
import { MonthlyTrendChart } from './components/MonthlyTrendChart';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function SubscriptionDashboardPage() {
    const [stats, setStats] = useState<SubscriptionStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response: ApiResponse<SubscriptionStats> = await getRequest('/admin/subscription/stats');
            setStats(response.data || null);
        } catch (err: any) {
            setError(err.message || 'An error occurred while retrieving statistics.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading statistics...</div>
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
                    <h2 className="text-3xl font-bold tracking-tight">Subscription Dashboard</h2>
                    <p className="text-muted-foreground">Monitor Pro upgrades and subscription metrics</p>
                </div>
                <Link href="/admin/subscriptions/list">
                    <Button>View All Subscriptions</Button>
                </Link>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Pro Users"
                    value={stats.totalProUsers}
                    description="Currently active Pro subscriptions"
                    icon={<Award className="h-4 w-4 text-blue-600" />}
                    trend={`${((stats.totalProUsers / stats.totalUsers) * 100).toFixed(1)}% of total users`}
                />
                <StatsCard
                    title="Conversion Rate"
                    value={`${stats.conversionRate}%`}
                    description="Free to Pro conversion"
                    icon={<TrendingUp className="h-4 w-4 text-green-600" />}
                    trend="Total user base"
                />
                <StatsCard
                    title="Average Duration"
                    value={`${stats.averageDurationDays}`}
                    description="Days on Pro plan"
                    icon={<Calendar className="h-4 w-4 text-purple-600" />}
                    trend="Average subscription lifetime"
                />
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    description={`${stats.totalFreeUsers} Free, ${stats.totalProUsers} Pro`}
                    icon={<Users className="h-4 w-4 text-orange-600" />}
                />
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Status</CardTitle>
                        <CardDescription>Breakdown of Pro subscription statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StatusBreakdownChart data={stats.statusBreakdown} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Trend</CardTitle>
                        <CardDescription>New Pro subscriptions over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MonthlyTrendChart data={stats.monthlyTrend} />
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common subscription management tasks</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Link href="/admin/subscriptions/list?status=active">
                        <Button variant="outline">View Active Subscriptions</Button>
                    </Link>
                    <Link href="/admin/subscriptions/list?status=cancelled">
                        <Button variant="outline">View Cancelled</Button>
                    </Link>
                    <Link href="/admin/subscriptions/list?status=trialing">
                        <Button variant="outline">View Trials</Button>
                    </Link>
                    <Link href="/admin/plans">
                        <Button variant="outline">Manage Plans</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(SubscriptionDashboardPage, {
    requiredRole: 'admin',
});

