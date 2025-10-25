'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Plus, 
    Users, 
    Clock, 
    Target, 
    Eye, 
    MoreVertical,
    Calendar,
    BookOpen,
    TrendingUp
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EditActivityModal from './modals/EditActivityModal';
import { IActivity } from '@/types/activity';
import activityService from '@/services/activity/activity.service';
import JoinActivityLink from '@/app/[locale]/activities/components/JoinActivityLink';

interface ActivityTabProps {
    classId: number;
}

export default function ActivityTab({ classId }: ActivityTabProps) {
    const router = useRouter();
    const t = useTranslations('activity');
    const tCommon = useTranslations('common');
    
    const [activities, setActivities] = useState<IActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<IActivity | null>(null);
    const [sharingActivity, setSharingActivity] = useState<string | null>(null);

    // Fetch activities from API
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                const response = await activityService.getActivitiesByClass(classId);
                
                if (response.success && response.data) {
                    setActivities(response.data);
                } else {
                    console.error('Failed to fetch activities:', response.message);
                    // Fallback to mock data for development
                    const mockActivities: IActivity[] = [
                        {
                            id: '1',
                            title: 'Quiz về từ vựng tiếng Anh',
                            description: 'Bài quiz kiểm tra từ vựng chương 1',
                            topicId: 1,
                            topicName: 'English Vocabulary',
                            classId: classId,
                            dueDate: '2024-01-20T23:59:59Z',
                            createdAt: '2024-01-15T10:00:00Z',
                            status: 'active',
                            totalStudents: 25,
                            completedStudents: 18,
                            inProgressStudents: 5,
                            averageScore: 78.5,
                            quizType: 'multiple-choice'
                        },
                        {
                            id: '2',
                            title: 'Flashcard học thuật ngữ',
                            description: 'Học thuật ngữ khoa học qua flashcards',
                            topicId: 2,
                            topicName: 'Science Terms',
                            classId: classId,
                            dueDate: '2024-01-25T23:59:59Z',
                            createdAt: '2024-01-18T14:30:00Z',
                            status: 'active',
                            totalStudents: 25,
                            completedStudents: 12,
                            inProgressStudents: 8,
                            averageScore: 85.2,
                            quizType: 'flashcard'
                        }
                    ];
                    setActivities(mockActivities);
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [classId]);


    const handleViewActivity = (activityId: string) => {
        router.push(`/activities/${activityId}`);
    };

    const handleEditActivity = (activityId: string) => {
        const activity = activities.find(a => a.id === activityId);
        if (activity) {
            setEditingActivity(activity);
            setIsEditModalOpen(true);
        }
    };

    const handleUpdateActivity = async (activityData: any) => {
        try {
            const response = await activityService.updateActivity({
                id: activityData.id,
                title: activityData.title,
                description: activityData.description,
                dueDate: activityData.dueDate.toISOString(),
                settings: activityData.settings
            });

            if (response.success) {
                // Refresh activities list
                const refreshResponse = await activityService.getActivitiesByClass(classId);
                if (refreshResponse.success && refreshResponse.data) {
                    setActivities(refreshResponse.data);
                }
                setIsEditModalOpen(false);
                setEditingActivity(null);
            } else {
                console.error('Failed to update activity:', response.message);
            }
        } catch (error) {
            console.error('Error updating activity:', error);
        }
    };

    const handleDeleteActivity = (activityId: string) => {
        // TODO: Implement delete functionality
        console.log('Delete activity:', activityId);
    };

    const handleShareActivity = (activityId: string) => {
        setSharingActivity(activityId);
    };

    const handleCloseShare = () => {
        setSharingActivity(null);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-semibold">Hoạt động học tập</h3>
                    <p className="text-sm text-muted-foreground">
                        Tạo và quản lý các hoạt động học tập cho lớp học
                    </p>
                </div>
            </div>

            {/* Activities List */}
            {activities.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Chưa có hoạt động nào</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Tạo hoạt động học tập đầu tiên để bắt đầu theo dõi tiến độ của học sinh
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((activity) => (
                        <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg line-clamp-2">
                                            {activity.title}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {activity.description}
                                        </p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleViewActivity(activity.id)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Xem chi tiết
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleShareActivity(activity.id)}>
                                                <Users className="mr-2 h-4 w-4" />
                                                Chia sẻ với học sinh
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEditActivity(activity.id)}>
                                                <Target className="mr-2 h-4 w-4" />
                                                Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleDeleteActivity(activity.id)}
                                                className="text-red-600"
                                            >
                                                <MoreVertical className="mr-2 h-4 w-4" />
                                                Xóa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                                {/* Status and Topic */}
                                <div className="flex items-center justify-between">
                                    <Badge className={getStatusColor(activity.status)}>
                                        {getStatusText(activity.status)}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {activity.topicName}
                                    </span>
                                </div>

                                {/* Progress Stats */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Tiến độ</span>
                                        <span className="font-medium">
                                            {activity.completedStudents}/{activity.totalStudents} học sinh
                                        </span>
                                    </div>
                                    <Progress 
                                        value={(activity.completedStudents / activity.totalStudents) * 100} 
                                        className="h-2"
                                    />
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>{activity.inProgressStudents} đang làm</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <span>{activity.averageScore}% TB</span>
                                    </div>
                                </div>

                                {/* Due Date */}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Hạn: {formatDate(activity.dueDate)}</span>
                                </div>

                                {/* Action Button */}
                                <Button 
                                    onClick={() => handleViewActivity(activity.id)}
                                    className="w-full"
                                    variant="outline"
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Xem chi tiết
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}


            {/* Edit Activity Modal */}
            <EditActivityModal
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                onSubmit={handleUpdateActivity}
                activity={editingActivity}
                classId={classId}
            />

            {/* Share Activity Modal */}
            {sharingActivity && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-md">
                        <JoinActivityLink
                            activityId={sharingActivity}
                            activityTitle={activities.find(a => a.id === sharingActivity)?.title || ''}
                            className="w-full"
                        />
                        <div className="mt-4 flex justify-end">
                            <Button variant="outline" onClick={handleCloseShare}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
