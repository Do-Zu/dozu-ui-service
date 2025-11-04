'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    BookOpen, 
    Clock, 
    Target, 
    Users, 
    Play, 
    CheckCircle,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { IActivity } from '@/types/activity';
import activityService from '@/services/activity/activity.service';
import { formatDate } from '@/utils';

interface JoinActivityPageProps {
    params: {
        activityId: string;
    };
}

export default function JoinActivityPage({ params }: JoinActivityPageProps) {
    const router = useRouter();
    const [activity, setActivity] = useState<IActivity | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                setLoading(true);
                const response = await activityService.getActivityById(params.activityId);
                
                if (response.success && response.data) {
                    setActivity(response.data);
                } else {
                    toast({
                        title: 'Activity not found',
                        description: 'The requested activity could not be found.',
                        variant: 'destructive',
                    });
                    router.push('/');
                }
            } catch (error) {
                console.error('Error fetching activity:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load activity details.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [params.activityId, router]);

    const handleJoinActivity = async () => {
        try {
            setJoining(true);
            // TODO: Get student ID from auth context
            const studentId = 'student-123'; // Replace with actual student ID
            
            const response = await activityService.startActivity(params.activityId, studentId);
            
            if (response.success) {
                toast({
                    title: 'Activity started',
                    description: 'You have successfully joined the activity!',
                });
                // Navigate to activity page or quiz
                router.push(`/activities/${params.activityId}/play`);
            } else {
                toast({
                    title: 'Failed to join',
                    description: response.message || 'Failed to join the activity.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error joining activity:', error);
            toast({
                title: 'Error',
                description: 'An error occurred while joining the activity.',
                variant: 'destructive',
            });
        } finally {
            setJoining(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Đang hoạt động';
            case 'completed':
                return 'Đã hoàn thành';
            case 'draft':
                return 'Bản nháp';
            default:
                return status;
        }
    };

    const isExpired = activity ? new Date(activity.dueDate) < new Date() : false;
    const isNotStarted = activity ? new Date(activity.createdAt) > new Date() : false;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Activity not found</h2>
                        <p className="text-gray-600">The requested activity could not be found.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <nav className="text-sm text-gray-500 mb-2">
                                <span>Activities</span>
                                <span className="mx-2">/</span>
                                <span>Join Activity</span>
                            </nav>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {activity.title}
                            </h1>
                            <p className="text-gray-600 mb-4">
                                {activity.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                                <Badge className={getStatusColor(activity.status)}>
                                    {getStatusText(activity.status)}
                                </Badge>
                                <span className="text-gray-500">
                                    {activity.topicName}
                                </span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-500">
                                    {activity.quizType}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Thông tin hoạt động
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Hạn nộp:</span>
                                <span className="font-medium">
                                    {formatDate(activity.dueDate)}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Số học sinh tham gia:</span>
                                <span className="font-medium">
                                    {activity.completedStudents + activity.inProgressStudents}/{activity.totalStudents}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Loại hoạt động:</span>
                                <span className="font-medium capitalize">
                                    {activity.quizType.replace('-', ' ')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Tiến độ lớp học
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Hoàn thành</span>
                                    <span>{activity.completedStudents}/{activity.totalStudents}</span>
                                </div>
                                <Progress 
                                    value={(activity.completedStudents / activity.totalStudents) * 100} 
                                    className="h-2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>{activity.completedStudents} hoàn thành</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                    <span>{activity.inProgressStudents} đang làm</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Messages */}
                {isExpired && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-red-800">
                                <AlertCircle className="h-5 w-5" />
                                <span className="font-medium">Hoạt động đã hết hạn</span>
                            </div>
                            <p className="text-red-600 text-sm mt-1">
                                Thời gian nộp bài đã kết thúc vào {formatDate(activity.dueDate)}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {isNotStarted && (
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-yellow-800">
                                <Clock className="h-5 w-5" />
                                <span className="font-medium">Hoạt động chưa bắt đầu</span>
                            </div>
                            <p className="text-yellow-600 text-sm mt-1">
                                Hoạt động sẽ bắt đầu vào {formatDate(activity.createdAt)}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Action Button */}
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center">
                            {isExpired ? (
                                <Button disabled className="w-full max-w-md">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Hoạt động đã hết hạn
                                </Button>
                            ) : isNotStarted ? (
                                <Button disabled className="w-full max-w-md">
                                    <Clock className="mr-2 h-4 w-4" />
                                    Hoạt động chưa bắt đầu
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleJoinActivity}
                                    disabled={joining}
                                    className="w-full max-w-md bg-blue-600 hover:bg-blue-700"
                                >
                                    {joining ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Đang tham gia...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="mr-2 h-4 w-4" />
                                            Tham gia hoạt động
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
