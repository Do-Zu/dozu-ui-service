import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProgressStatistics } from '@/hooks/useProgress';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, CheckCircle, Clock, Target } from 'lucide-react';

export function ProgressStatistics() {
  const { data: stats, loading, error } = useProgressStatistics();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500">Failed to load progress statistics</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const completionRate = (stats.completedContents / stats.totalContents) * 100;
  const inProgressRate = (stats.inProgressContents / stats.totalContents) * 100;
  const notStartedRate = (stats.notStartedContents / stats.totalContents) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Completion</span>
            <span className="text-sm text-muted-foreground">
              {stats.averageCompletionPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={stats.averageCompletionPercentage} className="h-2" />
        </div>

        {/* Content Status Breakdown */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Completed</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.completedContents} / {stats.totalContents}
              </span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">In Progress</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.inProgressContents} / {stats.totalContents}
              </span>
            </div>
            <Progress value={inProgressRate} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Not Started</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.notStartedContents} / {stats.totalContents}
              </span>
            </div>
            <Progress value={notStartedRate} className="h-2" />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-semibold text-blue-600">
              {stats.averageScore ? stats.averageScore.toFixed(1) : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">
              {Math.round(stats.totalTimeSpent / 3600 * 10) / 10}
            </div>
            <div className="text-xs text-muted-foreground">Total Hours</div>
          </div>
        </div>

        {stats.lastActiveAt && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Last active: {new Date(stats.lastActiveAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 