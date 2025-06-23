import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  useProgressStatistics, 
  useDashboardStatistics, 
  useDailyStudyRecords,
  useLearningMethodsDistribution,
  useWeeklyComparison,
  useCompletedTopics 
} from '@/hooks/useProgress';
import { ContentType } from '@/types/progress';
import DailyStudyBarChart from './DailyStudyBarChart';
import LearningMethodsPieChart from './LearningMethodsPieChart';

const ProgressDashboard: React.FC = () => {
  const { data: stats, loading: statsLoading, error: statsError } = useProgressStatistics();
  const { data: dashboard, loading: dashboardLoading, error: dashboardError } = useDashboardStatistics();
  const { data: dailyStudy, loading: dailyStudyLoading } = useDailyStudyRecords(7);
  const { data: learningMethods, loading: learningMethodsLoading } = useLearningMethodsDistribution();
  const { data: weeklyComparison, loading: weeklyComparisonLoading } = useWeeklyComparison();
  const { data: completedTopics, loading: completedTopicsLoading } = useCompletedTopics();

  if (statsLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading progress data...</div>
      </div>
    );
  }

  if (statsError || dashboardError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading progress data</div>
      </div>
    );
  }

  const getContentTypeColor = (type: ContentType) => {
    switch (type) {
      case ContentType.QUIZ:
        return 'bg-blue-500';
      case ContentType.FLASHCARD:
        return 'bg-green-500';
      case ContentType.VIDEO:
        return 'bg-purple-500';
      case ContentType.ARTICLE:
        return 'bg-orange-500';
      case ContentType.COURSE:
        return 'bg-indigo-500';
      case ContentType.LESSON:
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completedContents || 0}</div>
            <Progress 
              value={stats ? (stats.completedContents / stats.totalContents) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.inProgressContents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageScore?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Statistics */}
      {dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Study Overview</CardTitle>
              <CardDescription>Your learning progress this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Study Hours</span>
                <span className="font-bold">{dashboard.totalStudyHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Completed Topics</span>
                <span className="font-bold">{dashboard.completedTopics}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Weekly Change</span>
                <span className={`font-bold ${weeklyComparison?.percentageChange && weeklyComparison.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weeklyComparison?.percentageChange ? (weeklyComparison.percentageChange >= 0 ? '+' : '') + weeklyComparison.percentageChange.toFixed(1) : '0'}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Methods</CardTitle>
              <CardDescription>Distribution of your learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <LearningMethodsPieChart data={learningMethods || []} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Study Chart */}
      {dailyStudy && dailyStudy.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Study Hours (Last 7 Days)</CardTitle>
            <CardDescription>Your study time distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <DailyStudyBarChart data={dailyStudy || []} />
          </CardContent>
        </Card>
      )}

      {/* Completed Topics */}
      {/* {completedTopics && (
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Your learning milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {completedTopics.completedTopics}
              </div>
              <div className="text-gray-600">Topics Completed</div>
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
};

export default ProgressDashboard; 