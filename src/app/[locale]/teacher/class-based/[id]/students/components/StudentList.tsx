'use client';

import React, { useState, useEffect } from 'react';
import { MoreHorizontal, MoreVertical, User, UserMinus, Trophy, Star, TrendingUp, Shield, Flame } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IStudentInClass, StudentWithStreak } from '../../../../../class-based/types/class.type';
import { useTranslations } from 'next-intl';
import AvatarWithStreak from '@/components/ui/AvatarWithStreak';
import { useStreakListener, useGamification } from '@/contexts/gamification/GamificationContext';
import { useGamification as useGamificationHook } from '@/hooks/useGamification';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { leaderboardService } from '@/services/gamification/leaderboard.service';
import { LeaderboardEntry } from '@/types/streaks/leaderboard.types';
import { GamificationStats } from '@/types/streaks/gamification.type';
import StreakStatusBadge from './StreakStatusBadge';

interface StudentListProps {
    students: IStudentInClass[];
    classId?: number;
    handleRemoveClick: (studentId: number) => void;
    handleViewProfile: (student: IStudentInClass) => void;
}

export function StudentList({ students, classId, handleRemoveClick, handleViewProfile }: StudentListProps) {
    const tCommon = useTranslations('common');
    const tUser = useTranslations('user');
    const tStudentList = useTranslations('class.studentList');
    
    const [studentsWithStreaks, setStudentsWithStreaks] = useState<StudentWithStreak[]>(students);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
    const streakUpdate = useStreakListener();
    const { getStudentStreaks, getClassStudentStreaks } = useGamification();
    const { rank: currentUserRank, freeze: currentUserFreeze } = useGamificationHook();

    // Fetch streak data and leaderboard for all students
    const fetchStudentData = async () => {
            try {
                let streakMap: Map<number, GamificationStats>;
                let leaderboard: any = null;
                
                // Use batch API if classId is available, otherwise fallback to individual calls
                const userIds = students.map(student => student.userId);
                
                if (classId) {
                    const [classStreakMap, leaderboardData] = await Promise.all([
                        getClassStudentStreaks(classId, userIds),
                        leaderboardService.getWeeklyLeaderboard(classId)
                    ]);
                    streakMap = classStreakMap;
                    leaderboard = leaderboardData;
                } else {
                    const [individualStreakMap] = await Promise.all([
                        getStudentStreaks(userIds)
                    ]);
                    streakMap = individualStreakMap;
                }
                
                // First, create students with basic data
                const studentsWithBasicData = students.map(student => {
                    const streakData = streakMap.get(student.userId);
                    const leaderboardEntry = leaderboard?.entries?.find((entry: any) => entry.userId === student.userId);
                    
                    return {
                        ...student,
                        currentStreak: streakData?.currentStreak || 0,
                        points: leaderboardEntry?.points || streakData?.totalPoints || 0,
                        lessonsCompleted: leaderboardEntry?.lessonsCompleted || streakData?.totalLessonsCompleted || 0,
                        quizzesCompleted: leaderboardEntry?.quizzesCompleted || streakData?.totalQuizzesCompleted || 0,
                        averageScore: leaderboardEntry?.averageScore || streakData?.averageScore || 0,
                        streakFreezeActive: streakData?.streakFreezeActive || false,
                        streakFreezeCount: streakData?.streakFreezeCount || 0,
                        lastStudyDate: streakData?.lastStudyDate || null,
                    };
                });

                // Sort by points to create ranking
                const sortedStudents = [...studentsWithBasicData].sort((a, b) => b.points - a.points);
                
                // Add rank based on points ranking
                const studentsWithStreakData = sortedStudents.map((student, index) => ({
                    ...student,
                    rank: student.points > 0 ? index + 1 : null, // Only rank students with points > 0
                }));

                // Debug logging
                console.log('Students with ranking:', studentsWithStreakData.map(s => ({
                    username: s.username,
                    points: s.points,
                    rank: s.rank,
                    freeze: s.streakFreezeCount,
                    currentStreak: s.currentStreak,
                    note: classId ? 'This is CLASS-SPECIFIC streak' : 'This is GLOBAL streak'
                })));

                setStudentsWithStreaks(studentsWithStreakData);
                setLeaderboardData(leaderboard?.entries || []);
            } catch (error) {
                console.error('Error fetching student data:', error);
                setStudentsWithStreaks(students.map(s => ({ ...s, currentStreak: 0 })));
            }
        };

    useEffect(() => {
        if (students.length > 0) {
            fetchStudentData();
        }
    }, [students, getStudentStreaks, classId]);

    // Listen for streak updates using the new hook
    useEffect(() => {
        if (streakUpdate && streakUpdate.userId) {
            setStudentsWithStreaks(prev => 
                prev.map(student => 
                    student.userId === streakUpdate.userId 
                        ? { ...student, currentStreak: streakUpdate.currentStreak }
                        : student
                )
            );
        }
    }, [streakUpdate]);

    if (!students || students.length === 0) {
        return (
            <div className="w-full max-w-[95%] mx-auto mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{tStudentList('title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{tStudentList('emptyMessage')}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getInitials = (name: string | null, username: string) => {
        return (
            name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase() || username.substring(0, 2).toUpperCase()
        );
    };


    return (
        <div className="w-full max-w-[95%] mx-auto mt-4 space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{tStudentList('title')} ({studentsWithStreaks.length})</CardTitle>
                            <CardDescription>{tStudentList('description')}</CardDescription>
                        </div>
                        {classId && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                                >
                                    <Trophy className="w-4 h-4 mr-2" />
                                    {showLeaderboard ? 'Hide' : 'Show'} Leaderboard
                                </Button>
                                {showLeaderboard && (
                                    <div className="flex gap-1">
                                        <Button
                                            variant={timeRange === 'week' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setTimeRange('week')}
                                        >
                                            Weekly
                                        </Button>
                                        <Button
                                            variant={timeRange === 'month' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setTimeRange('month')}
                                        >
                                            Monthly
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Avatar</TableHead>
                                <TableHead>{tUser('fullName')}</TableHead>
                                <TableHead>{tUser('username')}</TableHead>
                                <TableHead>Streak</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead>Freeze</TableHead>
                                <TableHead>Rank</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead className="text-right">{tCommon('actions.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentsWithStreaks.map((student) => (
                                <TableRow key={student.userId}>
                                    <TableCell>
                                        <AvatarWithStreak
                                            src={student.avatarUrl}
                                            fallback={getInitials(student.fullName, student.username)}
                                            streak={student.currentStreak}
                                            size="md"
                                            showStreak={true}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{student.fullName || 'N/A'}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.username}</TableCell>
                                    <TableCell>
                                        <StreakStatusBadge
                                            currentStreak={student.currentStreak || 0}
                                            streakFreezeActive={student.streakFreezeActive || false}
                                            streakFreezeCount={student.streakFreezeCount || 0}
                                            lastStudyDate={student.lastStudyDate || null}
                                            currentPoints={student.points || 0}
                                            userId={student.userId}
                                            onPurchaseSuccess={() => {
                                                // Refresh student data after purchase
                                                fetchStudentData();
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <span className="font-semibold">{student.points || 0}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Shield className={`w-4 h-4 ${student.streakFreezeActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                            <span className={`text-sm font-medium ${student.streakFreezeActive ? 'text-blue-600' : 'text-gray-500'}`}>
                                                {student.streakFreezeCount || 0}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {student.rank && student.rank > 0 ? (
                                            <Badge variant={student.rank <= 3 ? "default" : "secondary"}>
                                                #{student.rank}
                                            </Badge>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs space-y-1">
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                <span>{student.lessonsCompleted || 0} lessons</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Trophy className="w-3 h-3" />
                                                <span>{student.quizzesCompleted || 0} quizzes</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:pointer-events-auto"
                                                >
                                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" side="top">
                                                <DropdownMenuItem onSelect={() => handleViewProfile(student)}>
                                                    <User className="mr-2 h-4 w-4" />
                                                    <span>{tStudentList('viewProfile')}</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-500"
                                                    onSelect={() => handleRemoveClick(student.userId)}
                                                >
                                                    <UserMinus className="mr-2 h-4 w-4" />
                                                    <span>{tStudentList('removeFromClass')}</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            {showLeaderboard && classId && (
                <Leaderboard 
                    classId={classId} 
                    timeRange={timeRange}
                    limit={20}
                />
            )}
        </div>
    );
}
