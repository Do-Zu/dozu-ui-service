import React from 'react';
import { CheckCircle, MoreHorizontal, MoreVertical, User, UserMinus, XCircle } from 'lucide-react';

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
import { ITeacherRequest } from '../types/teacherRequest.type';

export interface Props {
    requests: ITeacherRequest[];
    handleApproveClick: (requestId: number) => void;
    handleRejectClick: (requestId: number) => void;
}

export default function PendingRequestList({ requests, handleApproveClick, handleRejectClick }: Props) {
    if (!requests || requests.length === 0) {
        return (
            <div className="w-full max-w-[95%] mx-auto mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Teacher Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">No teachers have sent requests yet.</p>
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
                    <CardTitle>Pending Requests ({requests.length})</CardTitle>
                    <CardDescription>List of all pending teacher requests in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Avatar</TableHead>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((request) => {
                                const user = request.userInfo;
                                if (!user) return <div>User Not Found</div>;
                                return (
                                    <TableRow key={request.userId}>
                                        <TableCell>
                                            <Avatar>
                                                <AvatarImage src={user.avatarUrl} alt={user.username} />
                                                <AvatarFallback>
                                                    {getInitials(user.fullName, user.username)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{user.fullName || 'N/A'}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.username}</TableCell>
                                        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{request.description}</TableCell>
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
                                                    <DropdownMenuItem
                                                        className="text-green-600 dark:text-green-400"
                                                        onSelect={() => handleApproveClick(request.requestId)}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        <span>Approve</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 dark:text-red-400"
                                                        onSelect={() => handleRejectClick(request.requestId)}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        <span>Reject</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
