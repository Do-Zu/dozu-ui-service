'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MoreHorizontal, MoreVertical, User, UserMinus, Trophy, Star, TrendingUp, Shield, Flame, Users, Search, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    import { GamificationStats } from '@/types/streaks/gamification.type';
import StreakStatusBadge from './StreakStatusBadge';
import { InviteStudentsModal } from '@/components/class/InviteStudentsModal';

interface StudentListProps {
    students: IStudentInClass[];
    classId?: number;
    handleRemoveClick: (studentId: number) => void;
    handleViewProfile: (student: IStudentInClass) => void;
    invitationCode?: string;
}

export function StudentList({ students, classId, handleRemoveClick, handleViewProfile, invitationCode }: StudentListProps) {
    const tCommon = useTranslations('common');
    const tUser = useTranslations('user');
    const tStudentList = useTranslations('class.studentList');
    
    const [studentsWithStreaks, setStudentsWithStreaks] = useState<StudentWithStreak[]>(students);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const streakUpdate = useStreakListener();
    const { getStudentStreaks, getClassStudentStreaks } = useGamification();
    const { rank: currentUserRank, freeze: currentUserFreeze } = useGamificationHook();

    // Fetch streak data for all students
    const fetchStudentData = async () => {
            try {
                let streakMap: Map<number, GamificationStats>;
                
                // Use batch API if classId is available, otherwise fallback to individual calls
                const userIds = students.map(student => student.userId);
                
                if (classId) {
                    streakMap = await getClassStudentStreaks(classId, userIds);
                } else {
                    streakMap = await getStudentStreaks(userIds);
                }
                
                // Create students with streak data
                const studentsWithBasicData = students.map(student => {
                    const streakData = streakMap.get(student.userId);
                    
                    return {
                        ...student,
                        currentStreak: streakData?.currentStreak || 0,
                        points: streakData?.totalPoints || 0,
                        lessonsCompleted: streakData?.totalLessonsCompleted || 0,
                        quizzesCompleted: streakData?.totalQuizzesCompleted || 0,
                        averageScore: streakData?.averageScore || 0,
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

                setStudentsWithStreaks(studentsWithStreakData);
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

    // Filter students based on search query
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) {
            return studentsWithStreaks;
        }

        const query = searchQuery.toLowerCase().trim();
        return studentsWithStreaks.filter(student => {
            const fullName = student.fullName?.toLowerCase() || '';
            const username = student.username?.toLowerCase() || '';
            
            return fullName.includes(query) || 
                   username.includes(query) ;
        });
    }, [studentsWithStreaks, searchQuery]);

    // Clear search function
    const clearSearch = () => {
        setSearchQuery('');
    };

    if (!students || students.length === 0) {
        return (
            <div className="w-full max-w-[95%] mx-auto mt-4 space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{tStudentList('title')}</CardTitle>
                                <CardDescription>{tStudentList('description')}</CardDescription>
                            </div>
                            {classId && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowInviteModal(true)}
                                    >
                                        <Users className="w-4 h-4 mr-2" />
                                        Invite Students
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{tStudentList('emptyMessage')}</p>
                    </CardContent>
                </Card>

                {/* Invite Students Modal */}
                {classId && (
                    <InviteStudentsModal
                        open={showInviteModal}
                        onOpenChange={setShowInviteModal}
                        classId={classId}
                        invitationCode={invitationCode}
                    />
                )}
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
                            <CardTitle>
                                {tStudentList('title')} ({filteredStudents.length}{searchQuery ? ` of ${studentsWithStreaks.length}` : ''})
                            </CardTitle>
                            <CardDescription 
                                className="text-muted-foreground pt-4"
                            >{tStudentList('description')}</CardDescription>
                        </div>
                        {classId && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowInviteModal(true)}
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    Invite Students
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search Input */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search students username"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-10"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSearch}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        {searchQuery && (
                            <p className="text-sm text-gray-500 mt-1">
                                {filteredStudents.length === 0 
                                    ? 'No students found matching your search'
                                    : `Found ${filteredStudents.length} student${filteredStudents.length === 1 ? '' : 's'}`
                                }
                            </p>
                        )}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Avatar</TableHead>
                                <TableHead>{tUser('fullName')}</TableHead>
                                <TableHead>{tUser('username')}</TableHead>
                                <TableHead>Streak</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead>Rank</TableHead>
                                <TableHead className="text-right">{tCommon('actions.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.length === 0 && searchQuery ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 text-gray-400" />
                                            <p className="text-gray-500">No students found matching "{searchQuery}"</p>
                                            <Button variant="outline" size="sm" onClick={clearSearch}>
                                                Clear search
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student) => (
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
                                        {student.rank && student.rank > 0 ? (
                                            <Badge variant={student.rank <= 3 ? "default" : "secondary"}>
                                                #{student.rank}
                                            </Badge>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Invite Students Modal */}
            {classId && (
                <InviteStudentsModal
                    open={showInviteModal}
                    onOpenChange={setShowInviteModal}
                    classId={classId}
                    invitationCode={invitationCode}
                />
            )}
        </div>
    );
}
