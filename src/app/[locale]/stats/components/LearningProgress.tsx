'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from 'lucide-react';
import { StatsOverview } from './StatsOverview';
import { StatsLearningMethods } from './StatsLearningMethods';
import { ReportFooter } from './ReportFooter';
// import { useDashboardStatistics } from '@/hooks/useProgress';
// import { Skeleton } from '@/components/ui/skeleton';

interface LearningProgressProps {
  weekOf?: string;
}

export default function LearningProgress({ weekOf = 'Jun 21, 2025' }: LearningProgressProps) {
  // const { data: dashboardData, loading, error } = useDashboardStatistics();

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
      <TabsContent value="overview">
          <StatsOverview />
        </TabsContent>
        {/* <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="learning-methods">Learning Methods</TabsTrigger>
          <TabsTrigger value="completed-topics">Completed Topics</TabsTrigger>
          <TabsTrigger value="reflections">Reflections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StatsOverview />
        </TabsContent>

        <TabsContent value="learning-methods">
          <div className="py-4">
            <div className="text-sm text-muted-foreground">Coming soon...</div>
          </div>
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
        </TabsContent> */}
      </Tabs>
      <ReportFooter
        onExportPdf={handleExportPdf}
        onPrint={handlePrint}
        onShare={handleShare}
        onExport={handleExport}
      />
    </Card>
  );
}
