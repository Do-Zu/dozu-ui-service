// components/TeacherRequestStatus.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Hourglass, CheckCircle, XCircle } from 'lucide-react';
import { ITeacherRequest } from '../../admin/teacher-requests/types/teacherRequest.type';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ShowIf } from '@/components/ui/ShowIf';

interface RequestStatusProps {
    request: ITeacherRequest;
}

const statusConfig = {
    pending: {
        variant: 'default',
        text: 'Pending Review',
        icon: <Hourglass className="h-4 w-4" />,
        alertTitle: 'Your application is under review.',
        alertDescription:
            'We are currently reviewing your application. You will become a teacher once the application is approved by Admin',
    },
    approved: {
        variant: 'secondary',
        text: 'Approved',
        icon: <CheckCircle className="h-4 w-4" />,
        alertTitle: 'Congratulations! Your application has been approved.',
        alertDescription: 'You now have teacher privileges. You can start creating classes and topics.',
    },
    rejected: {
        variant: 'destructive',
        text: 'Rejected',
        icon: <XCircle className="h-4 w-4" />,
        alertTitle: 'Application Not Approved',
        alertDescription:
            'Unfortunately, your application was not approved at this time. Please review our guidelines and you may reapply later.',
    },
};

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export default function TeacherRequestStatus({ request }: RequestStatusProps) {
    const router = useRouter();
    const config = statusConfig[request.status];

    function handleReapplyClick() {
        router.push('/request-teacher/reapply');
    }

    return (
        <Card className="w-full max-w-2xl mx-auto mt-4">
            <CardHeader>
                <CardTitle>My Application Status</CardTitle>
                <CardDescription>Here are the details of the request you submitted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <Badge variant={config.variant as BadgeVariant} className="text-sm">
                        {config.icon}
                        <span className="ml-2">{config.text}</span>
                    </Badge>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Submitted on</p>
                    <p className="text-foreground">
                        {new Date(request.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Your message</p>
                    <blockquote className="p-4 border-l-4 bg-muted/50 text-foreground">
                        {request.description}
                    </blockquote>
                </div>

                <Alert variant={request.status === 'rejected' ? 'destructive' : 'default'}>
                    {config.icon}
                    <AlertTitle>{config.alertTitle}</AlertTitle>
                    <AlertDescription>{config.alertDescription}</AlertDescription>
                </Alert>

                <ShowIf when={request.status === 'rejected'}>
                    <div className="flex justify-end">
                        <Button onClick={handleReapplyClick}>Reapply</Button>
                    </div>
                </ShowIf>
            </CardContent>
        </Card>
    );
}
