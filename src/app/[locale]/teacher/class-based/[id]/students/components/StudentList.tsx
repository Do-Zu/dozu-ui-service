import React from 'react';
import { MoreHorizontal, MoreVertical, User, UserMinus } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IStudentInClass } from '../../../../../class-based/types/class.type';
import { useTranslations } from 'next-intl';

interface StudentListProps {
    students: IStudentInClass[];
    handleRemoveClick: (studentId: number) => void;
}

export function StudentList({ students, handleRemoveClick }: StudentListProps) {
    const tCommon = useTranslations('common');
    const tUser = useTranslations('user');
    const tStudentList = useTranslations('class.studentList');

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
        <div className="w-full max-w-[95%] mx-auto mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>{tStudentList('title')} ({students.length})</CardTitle>
                    <CardDescription>{tStudentList('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Avatar</TableHead>
                                <TableHead>{tUser('fullName')}</TableHead>
                                <TableHead>{tUser('username')}</TableHead>
                                <TableHead>Enrolled At</TableHead>
                                <TableHead className="text-right">{tCommon('actions.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.userId}>
                                    <TableCell>
                                        <Avatar>
                                            <AvatarImage src={student.avatarUrl} alt={student.username} />
                                            <AvatarFallback>
                                                {getInitials(student.fullName, student.username)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{student.fullName || 'N/A'}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.username}</TableCell>
                                    <TableCell>{new Date(student.enrolledAt).toLocaleDateString()}</TableCell>
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
                                                <DropdownMenuItem>
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
        </div>
    );
}
