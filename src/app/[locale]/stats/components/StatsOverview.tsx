import { BarChart, Clock, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { KeyMetricCard } from './KeyMetricCard';
import { DailyStudyChart } from './DailyStudyChart';
import { LearningMethodsChart } from './LearningMethodsChart';
import { useDashboardStatistics, useLearningMethodsDistribution } from '@/hooks/useProgress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function StatsOverview() {
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboardStatistics();
  const { data: learningMethodsData, loading: methodsLoading, error: methodsError } = useLearningMethodsDistribution();
  const router = useRouter();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  if (dashboardLoading || methodsLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (dashboardError || methodsError) {
    const isAuthError = dashboardError === 'Authentication required' || methodsError === 'Authentication required';
    
    return (
      <div className="space-y-8">
        {isAuthError ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="text-6xl">🔐</div>
                <h3 className="text-xl font-semibold">Authentication Required</h3>
                <p className="text-muted-foreground">
                  You need to be logged in to view your learning statistics.
                </p>
                <Button onClick={handleLogin}>
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load statistics data</p>
            <p className="text-sm text-muted-foreground mt-2">
              {dashboardError || methodsError}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!dashboardData || !learningMethodsData) {
    return null;
  }

  const { totalStudyHours, averageDailyStudy, completedTopics, weeklyComparison, dailyStudyHours } = dashboardData;
  const percentChange = weeklyComparison.percentageChange;

  // Transform learning methods data for the chart
  const learningMethodsChartData = learningMethodsData.reduce((acc, item) => {
    acc[item.method.toLowerCase()] = item.percentage;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <KeyMetricCard
          title="Total Study Hours"
          value={totalStudyHours}
          unit="hours"
          change={`${percentChange >= 0 ? '+' : ''}${percentChange}% from previous week`}
          icon={Clock}
        />

        <KeyMetricCard
          title="Average Daily Study"
          value={averageDailyStudy}
          unit="hours/day"
          topText="Top 15% of all users"
          icon={Target}
        />

        <KeyMetricCard
          title="Completed Topics"
          value={completedTopics}
          unit="items"
          change={`+${percentChange}% from previous week`}
          icon={BarChart}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-4">Daily Study Hours</h3>
            <DailyStudyChart stats={dailyStudyHours} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-4">Learning Methods Distribution</h3>
            <LearningMethodsChart methods={learningMethodsChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
