'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, MoreVertical, RefreshCw, Users, Clock, TrendingUp, AlertCircle, Calendar, FileText, BookOpen, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ActivityMonitorData } from '@/types/activity';
import { downloadExcelFile } from '@/app/[locale]/activities/utils/excelGenerator';
import activityService from '@/services/activity/activity.service';
import { adaptQuizClassResultsToActivityMonitor } from '@/app/[locale]/activities/utils/dataAdapter';
import ActivitySummaryTab from '@/app/[locale]/activities/components/ActivitySummaryTab';
import StudentSummaryTab from '@/app/[locale]/activities/components/StudentSummaryTab';
import TermProgressTab from '@/app/[locale]/activities/components/TermProgressTab';
import StudentResultsTab from '@/app/[locale]/activities/components/StudentResultsTab';

interface ActivityPageProps {
  params: {
    id: string;
    activityId: string;
  };
}

export default function TeacherActivityPage({ params }: ActivityPageProps) {
  const [activityData, setActivityData] = useState<ActivityMonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        
        const response = await activityService.getActivityMonitoringData(params.activityId);
        
        if (response.success && response.data) {
          // Adapt backend data to UI format
          const { quizResults, questionAnalysis } = response.data;
          const adaptedData = adaptQuizClassResultsToActivityMonitor(quizResults, questionAnalysis);
          setActivityData(adaptedData);
        } else {
          console.error('Failed to fetch activity data:', response.message);
          setActivityData(null);
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
        setActivityData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [params.activityId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-muted rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 dark:bg-muted rounded"></div>
              <div className="h-64 bg-gray-200 dark:bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-foreground mb-2">Activity not found</h2>
            <p className="text-gray-600 dark:text-muted-foreground">The requested activity could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const { activity, students, performance, questions } = activityData;
  const completionPercentage = (activity.completedStudents / activity.totalStudents) * 100;

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await activityService.getActivityMonitoringData(params.activityId);
      
      if (response.success && response.data) {
        // Adapt backend data to UI format
        const { quizResults, questionAnalysis } = response.data;
        const adaptedData = adaptQuizClassResultsToActivityMonitor(quizResults, questionAnalysis);
        setActivityData(adaptedData);
        toast({
          title: 'Data refreshed',
          description: 'Activity data has been updated successfully.',
        });
      } else {
        toast({
          title: 'Refresh failed',
          description: 'Failed to refresh activity data.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: 'Refresh failed',
        description: 'An error occurred while refreshing data.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadExcel = () => {
    if (activityData) {
      try {
        const filename = `Quizlet-activity-${activity.id}.xlsx`;
        downloadExcelFile(activityData, filename);
        toast({
          title: 'Download successful',
          description: `File ${filename} has been downloaded successfully.`,
        });
      } catch (error) {
        console.error('Error downloading Excel file:', error);
        toast({
          title: 'Download failed',
          description: 'There was an error downloading the file. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-background dark:to-muted rounded-xl shadow-md border border-gray-200 dark:border-border overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 dark:text-muted-foreground mb-4">
              <span className="hover:text-gray-700 dark:hover:text-foreground cursor-pointer transition-colors">Your Library</span>
              <span className="mx-2">/</span>
              <span className="hover:text-gray-700 dark:hover:text-foreground cursor-pointer transition-colors">Activities</span>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-foreground font-medium">{activity.title}</span>
            </nav>

            <div className="space-y-4">
              {/* Title Section */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-primary/10 rounded-lg mt-1">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-primary" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-foreground leading-tight">
                      {activity.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {activity.quizType}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-600 dark:text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        <span>Due by {new Date(activity.dueDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description/Content Section */}
              {activity.description && activity.description.trim() && (
                <div className="p-4 bg-gray-50 dark:bg-muted rounded-lg border border-gray-200 dark:border-border">
                  <p className="text-sm text-gray-700 dark:text-foreground leading-relaxed whitespace-pre-wrap">
                    {activity.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Student Results Download Section */}
        <Card className="bg-white dark:bg-background">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-foreground">
              Download student results
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              View and download results until {new Date(activity.dueDate).toLocaleDateString()} at 23:59
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Button 
                  onClick={handleDownloadExcel}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/90 text-white px-6 py-3"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download .xlsx file
                </Button>
              </div>
              <div className="hidden md:block">
                {/* Decorative chart illustration */}
                <div className="w-32 h-24 bg-gradient-to-br from-green-100 to-yellow-100 dark:bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-4xl">📊</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-background">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">Tổng học sinh</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-foreground">{activity.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-background">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">Đã hoàn thành</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-foreground">{activity.completedStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-background">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">Đang làm</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-foreground">{activity.inProgressStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-background">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-primary/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-purple-600 dark:text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">Chưa bắt đầu</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-foreground">
                    {activity.totalStudents - activity.completedStudents - activity.inProgressStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="activity-summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity-summary">Tóm lược hoạt động</TabsTrigger>
            <TabsTrigger value="student-summary">Tóm lược học sinh</TabsTrigger>
            <TabsTrigger value="term-progress">Tiến trình thuật ngữ</TabsTrigger>
            <TabsTrigger value="student-results">Kết quả của học sinh</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity-summary" className="mt-6">
            <ActivitySummaryTab 
              activity={activity} 
              completionPercentage={completionPercentage}
              performance={performance}
            />
          </TabsContent>
          
          <TabsContent value="student-summary" className="mt-6">
            <StudentSummaryTab students={students} />
          </TabsContent>
          
          <TabsContent value="term-progress" className="mt-6">
            <TermProgressTab questions={questions} performance={performance} />
          </TabsContent>
          
          <TabsContent value="student-results" className="mt-6">
            <StudentResultsTab students={students} questions={questions} />
          </TabsContent>
        </Tabs>

        {/* Footer Disclaimer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-500 dark:text-muted-foreground">
            Class quiz data is for educational purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}

