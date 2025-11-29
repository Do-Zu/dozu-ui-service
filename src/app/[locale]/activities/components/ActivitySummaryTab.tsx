'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ActivityDetails, PerformanceBreakdown } from '@/types/activity';

interface ActivitySummaryTabProps {
  activity: ActivityDetails;
  completionPercentage: number;
  performance: PerformanceBreakdown;
}

export default function ActivitySummaryTab({ activity, completionPercentage, performance }: ActivitySummaryTabProps) {
  const t = useTranslations('activities');
  
  return (
    <div className="space-y-6">

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('activitySummary.overallProgress')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-foreground">
                {activity.completedStudents} {t('activitySummary.participated')}
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">
                {activity.completedStudents} {t('activitySummary.completed')}
              </span>
              <span className="text-gray-600 dark:text-muted-foreground">
                {activity.notStartedStudents} {t('activitySummary.notCompleted')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('activitySummary.classStatistics')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-primary/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-foreground">{activity.averageScore}%</div>
              <div className="text-sm text-gray-600 dark:text-muted-foreground">{t('activitySummary.averageScore')}</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-500/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-foreground">{performance.excellent}</div>
              <div className="text-sm text-gray-600 dark:text-muted-foreground">{t('activitySummary.studentsAbove80')}</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-destructive/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-foreground">{performance.poor}</div>
              <div className="text-sm text-gray-600 dark:text-muted-foreground">{t('activitySummary.studentsBelow50')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
