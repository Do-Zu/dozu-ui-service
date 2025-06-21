import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { useWeeklyComparison } from '@/hooks/useProgress';
// import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { weeklyComparisonMockData } from './mockData';

export function WeeklyComparison() {
  // const { data: comparison, loading, error } = useWeeklyComparison();
  const comparison = weeklyComparisonMockData;

  /*
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500 text-sm">Failed to load weekly comparison</p>
        </CardContent>
      </Card>
    );
  }
  */

  if (!comparison) {
    return null;
  }

  const { totalStudyHours, percentageChange } = comparison;
  const isPositive = percentageChange > 0;
  const isNegative = percentageChange < 0;
  const isNeutral = percentageChange === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weekly Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{totalStudyHours}</div>
            <div className="text-sm text-muted-foreground">Study Hours This Week</div>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            isPositive ? 'bg-green-100 text-green-700' :
            isNegative ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {isPositive && <TrendingUp className="h-4 w-4" />}
            {isNegative && <TrendingDown className="h-4 w-4" />}
            {isNeutral && <Minus className="h-4 w-4" />}
            <span>
              {isPositive ? '+' : ''}{percentageChange}%
            </span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {isPositive && (
            <p>Great job! You've increased your study time by {percentageChange}% compared to last week.</p>
          )}
          {isNegative && (
            <p>You've studied {Math.abs(percentageChange)}% less this week compared to last week.</p>
          )}
          {isNeutral && (
            <p>Your study time is consistent with last week.</p>
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {Math.round(totalStudyHours / 7 * 10) / 10}
              </div>
              <div className="text-xs text-muted-foreground">Avg. Hours/Day</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {Math.round(totalStudyHours * 60)}
              </div>
              <div className="text-xs text-muted-foreground">Total Minutes</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 