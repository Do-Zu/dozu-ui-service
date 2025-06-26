import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Printer, 
  Share2, 
  Download,
  ChevronDown 
} from 'lucide-react';
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
      // case ContentType.VIDEO:
      //   return 'bg-purple-500';
      // case ContentType.ARTICLE:
      //   return 'bg-orange-500';
      // case ContentType.COURSE:
      //   return 'bg-indigo-500';
      // case ContentType.LESSON:
        // return 'bg-pink-500';
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
      <Card>
        <CardHeader>
          <CardTitle>Daily Study Hours (Last 7 Days)</CardTitle>
          <CardDescription>Your study time distribution</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyStudyLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-sm text-gray-500">Loading chart data...</div>
            </div>
          ) : (
            <DailyStudyBarChart data={dailyStudy || []} />
          )}
        </CardContent>
      </Card>

      {/* Report Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Report generated on {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Export Format Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Print Button */}
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>

              {/* Share Button */}
              <Button variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>

              {/* Export Button */}
              <Button onClick={() => handleExport('pdf')} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );

  // Handler functions
  function handleExport(format: 'pdf' | 'excel' | 'csv') {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}...`);
    // You can implement actual export logic here
    // For example, using libraries like jsPDF, xlsx, etc.
  }

  function handlePrint() {
    // TODO: Implement print functionality
    console.log('Printing report...');
    window.print();
  }

  function handleShare() {
    // TODO: Implement share functionality
    console.log('Sharing report...');
    if (navigator.share) {
      navigator.share({
        title: 'Learning Progress Report',
        text: 'Check out my learning progress!',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You might want to show a toast notification here
    }
  }
};

export default ProgressDashboard; 