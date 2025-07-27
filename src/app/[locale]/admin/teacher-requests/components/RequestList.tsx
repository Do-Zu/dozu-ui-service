import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ITeacherRequest, ITeacherRequestStatus } from '../types/teacherRequest.type';
import { CheckCircle, Hourglass, XCircle } from 'lucide-react';

export interface Props {
    requests: ITeacherRequest[];
}

export default function RequestList({ requests }: Props) {
    if (!requests || requests.length === 0) {
        return (
            <div className="w-full max-w-[95%] mx-auto mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Teacher Requests</CardTitle>
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

    function formatRequestStatus(status: ITeacherRequestStatus) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function renderRequestStatus(status: ITeacherRequestStatus) {
        return (
            <div className='flex flex-row gap-2'>
                <div>
                    {status === 'pending' ? <Hourglass /> : null}
                    {status === 'approved' ? <CheckCircle className='text-green-600 dark:text-green-400' /> : null}
                    {status === 'rejected' ? <XCircle className='text-red-600 dark:text-red-400' /> : null}
                </div>

                {formatRequestStatus(status)}
            </div>
        )
    }

    return (
        <div className="w-full max-w-[95%] mx-auto mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Requests ({requests.length})</CardTitle>
                    <CardDescription>List of all teacher requests in the system.</CardDescription>
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
                                <TableHead>Status</TableHead>
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
                                        <TableCell>
                                            {renderRequestStatus(request.status)}
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
