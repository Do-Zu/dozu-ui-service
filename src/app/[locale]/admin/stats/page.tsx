'use client';

import { withAuth } from '@/hoc/withAuth';
import { useMemo } from 'react';
import useFetch from '@/hooks/useFetch';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function AdminStatsPage() {
  const {
    data,
    loading,
    error,
  } = useFetch<{
    total: number;
    active: number;
    verified: number;
    onboarded: number;
    newUsers: number;
  }>('/admin/users/user-stats');

  const barData = useMemo(() => {
    return {
      labels: ['Total', 'Active', 'Verified', 'Onboarded', 'New Users'],
      datasets: [
        {
          label: 'Users',
          data: data ? [data.total, data.active, data.verified, data.onboarded, data.newUsers] : [],
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
        },
      ],
    };
  }, [data]);

  const doughnutData = useMemo(() => {
    return {
      labels: ['Active', 'Inactive'],
      datasets: [
        {
          label: 'User Status',
          data: data ? [data.active, data.total - data.active] : [],
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)',
            'rgba(239, 68, 68, 0.7)',
          ],
        },
      ],
    };
  }, [data]);

  if (loading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  if (error) {
    return <p className="text-destructive">Error loading stats: {error}</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">User statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Overview</h3>
            <Bar data={barData} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Status Breakdown</h3>
            <Doughnut data={doughnutData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(AdminStatsPage, {
  requiredRole: 'admin',
});
