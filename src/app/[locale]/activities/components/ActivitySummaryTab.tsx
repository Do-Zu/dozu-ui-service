'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ActivityDetails } from '@/types/activity';

interface ActivitySummaryTabProps {
  activity: ActivityDetails;
  completionPercentage: number;
}

export default function ActivitySummaryTab({ activity, completionPercentage }: ActivitySummaryTabProps) {
  return (
    <div className="space-y-6">

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {activity.completedStudents} participated
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">
                {activity.completedStudents} completed
              </span>
              <span className="text-gray-600">
                {activity.notStartedStudents} not completed
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Class Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">52%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Students Above 80%</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-600">Students Below 50%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
