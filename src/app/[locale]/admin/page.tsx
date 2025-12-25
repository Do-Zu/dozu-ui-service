'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, ShieldCheck, Activity } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { UserSignupChart } from './components/Chart';
import { RecentActivity } from './components/RecentActivity';
import { useEffect, useState } from 'react';
import { getRequest } from '@/api/api';
import { UserBasic, GetUsersQuery } from '@/types/user';
import { toast } from '@/hooks/use-toast';
import { withAuth } from '@/hoc/withAuth';

function AdminDashboardPage() {
  const [users, setUsers] = useState<UserBasic[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRequest<GetUsersQuery, UserBasic[]>('/admin/users');
        setUsers(response.data ?? []);
      } catch (error) {
        toast({
        variant: 'destructive',
        title: 'Failed to fetch users',
        description: 'Something went wrong while loading users.',
        });
      }
    };

    fetchData();
  }, []);

  const totalUsers = users.length;

  const newUsersToday = users.filter((user) => {
    const createdDate = new Date(user.createdAt);
    const today = new Date();
    return createdDate.toDateString() === today.toDateString();
  }).length;

  const blockedUsers = users.filter((user) => !user.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening.</p>
      </div>

      <Separator />

      {/* Summary Cards */}
      <div className="flex flex-wrap justify-center gap-4">
        <Card className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] max-w-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">+{totalUsers - 999} this week</p>
          </CardContent>
        </Card>

        <Card className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] max-w-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newUsersToday}</div>
            <p className="text-xs text-muted-foreground">+{newUsersToday} today</p>
          </CardContent>
        </Card>

        <Card className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] max-w-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedUsers}</div>
            <p className="text-xs text-muted-foreground">{blockedUsers > 0 ? `${blockedUsers} blocked` : 'No blocks'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <UserSignupChart users={users}/>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivity />
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(AdminDashboardPage, {
  requiredRole: 'admin',
});

