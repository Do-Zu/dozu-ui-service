'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from 'lucide-react';
import { StatsOverview } from './StatsOverview';
import { StatsLearningMethods } from './StatsLearningMethods';
// import { ReportFooter } from './reportFooter';
import { useDashboardStatistics } from '@/hooks/useProgress';
import { Skeleton } from '@/components/ui/skeleton';

interface LearningProgressProps {
  weekOf?: string;
}

export default function LearningProgress({ weekOf = new Date().toLocaleDateString() }: LearningProgressProps) {
  const { data: dashboardData, loading, error } = useDashboardStatistics();

  const handleExportPdf = () => {
    // Implement PDF export functionality
    console.log('Exporting PDF...');
  };

  const handlePrint = () => {
    // Implement print functionality
    window.print();
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing report...');
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting report...');
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <div className="p-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Learning Progress Report</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your learning journey and export detailed reports
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Week of {weekOf}</span>
            </div>
          </div>
        </CardHeader>
        <div className="p-6 text-center">
          <p className="text-red-500">Failed to load learning progress data</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Learning Progress Report</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track your learning journey and export detailed reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Week of {weekOf}</span>
          </div>
        </div>
      </CardHeader>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="completed-topics">Completed Topics</TabsTrigger>
          <TabsTrigger value="reflections">Reflections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StatsOverview />
        </TabsContent>

        <TabsContent value="completed-topics">
          <div className="py-4">
            <div className="text-sm text-muted-foreground">Coming soon...</div>
          </div>
        </TabsContent>

        <TabsContent value="reflections">
          <div className="py-4">
            <div className="text-sm text-muted-foreground">Coming soon...</div>
          </div>
        </TabsContent>
      </Tabs>
      {/* <ReportFooter
        onExportPdf={handleExportPdf}
        onPrint={handlePrint}
        onShare={handleShare}
        onExport={handleExport}
      /> */}
    </Card>
  );
}
