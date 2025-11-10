'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, MoreVertical, RefreshCw, Users, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateMockActivityData } from '../utils/mockData';
import { ActivityMonitorData } from '@/types/activity';
import { downloadExcelFile } from '../utils/excelGenerator';
import activityService from '@/services/activity/activity.service';
import { adaptQuizClassResultsToActivityMonitor } from '../utils/dataAdapter';
import ActivitySummaryTab from '../components/ActivitySummaryTab';
import StudentSummaryTab from '../components/StudentSummaryTab';
import TermProgressTab from '../components/TermProgressTab';
import StudentResultsTab from '../components/StudentResultsTab';

interface ActivityPageProps {
  params: {
    activityId: string;
  };
}

export default function ActivityPage({ params }: ActivityPageProps) {
  const [activityData, setActivityData] = useState<ActivityMonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch real data first
        const response = await activityService.getActivityMonitoringData(params.activityId);
        
        if (response.success && response.data) {
          // Adapt backend data to UI format
          const { quizResults, questionAnalysis } = response.data;
          const adaptedData = adaptQuizClassResultsToActivityMonitor(quizResults, questionAnalysis);
          setActivityData(adaptedData);
        } else {
          // Fallback to mock data for development
          console.log('Using mock data for development');
          const data = generateMockActivityData();
          setActivityData(data);
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
        // Fallback to mock data
        const data = generateMockActivityData();
        setActivityData(data);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [params.activityId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Activity not found</h2>
            <p className="text-gray-600">The requested activity could not be found.</p>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <nav className="text-sm text-gray-500 mb-2">
                <span>Your Library</span>
                <span className="mx-2">/</span>
                <span>Activities</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Activity for {activity.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-blue-600">
                <span>{activity.title}</span>
                <span>•</span>
                <span>{activity.quizType}</span>
                <span>•</span>
                <span>Due by {new Date(activity.dueDate).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Student Results Download Section */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Download student results
            </CardTitle>
            <p className="text-sm text-gray-600">
              View and download results until {new Date(activity.dueDate).toLocaleDateString()} at 23:59
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Button 
                  onClick={handleDownloadExcel}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download .xlsx file
                </Button>
              </div>
              <div className="hidden md:block">
                {/* Decorative chart illustration */}
                <div className="w-32 h-24 bg-gradient-to-br from-green-100 to-yellow-100 rounded-lg flex items-center justify-center">
                  <div className="text-4xl">📊</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng học sinh</p>
                  <p className="text-2xl font-semibold">{activity.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đã hoàn thành</p>
                  <p className="text-2xl font-semibold">{activity.completedStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đang làm</p>
                  <p className="text-2xl font-semibold">{activity.inProgressStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chưa bắt đầu</p>
                  <p className="text-2xl font-semibold">
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
          <p className="text-xs text-gray-500">
            Class quiz data is for educational purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
