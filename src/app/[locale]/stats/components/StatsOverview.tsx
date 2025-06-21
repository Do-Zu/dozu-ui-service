import { Users, FileText, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { KeyMetricCard } from './KeyMetricCard';
import { DailyStudyChart } from './DailyStudyChart';
import { LearningMethodsChart } from './LearningMethodsChart';
import { dashboardMockData, learningMethodsMockData } from './mockData';

export function StatsOverview() {
  const dashboardData = dashboardMockData;
  const learningMethodsData = learningMethodsMockData;

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
          change={`+${percentChange}% from previous week`}
          icon={Clock}
        />

        <KeyMetricCard
          title="Average Daily Study"
          value={averageDailyStudy}
          unit="hours/day"
          topText="Top 15% of all users"
          icon={Users}
        />

        <KeyMetricCard
          title="Completed Items"
          value={completedTopics}
          unit="items"
          change={'+8 items from previous week'}
          icon={FileText}
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
