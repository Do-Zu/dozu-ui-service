'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Mock data (for now)
const mockAssignment = {
    assignmentId: 8,
    classId: 1,
    topicId: 35,
    title: 'History assignment',
    description: 'Writing about history.',
    createdAt: '2025-10-24T08:02:43.826Z',
    attachments: [
        {
            attachmentId: 1,
            title: 'How Your Brain Alters Your Reality.mp4',
            contentType: 'video/mp4',
            metadata: { size: '34MB' },
            createdAt: '2025-10-24T09:00:00.000Z',
        },
        {
            attachmentId: 2,
            title: 'Wikipedia, bách khoa toàn thư mở.png',
            contentType: 'image/png',
            metadata: { size: '2.1MB' },
            createdAt: '2025-10-24T09:05:00.000Z',
        },
        {
            attachmentId: 3,
            title: 'Basic English - Wikipedia.pdf',
            contentType: 'application/pdf',
            metadata: { size: '1.8MB' },
            createdAt: '2025-10-24T09:10:00.000Z',
        },
    ],
};

export default function Page() {
    const assignment = mockAssignment;

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold">{assignment.title}</h1>
                <p className="text-muted-foreground">
                    Hoàng Kỳ Anh •{' '}
                    {new Date(assignment.createdAt).toLocaleDateString('vi-VN', {
                        day: 'numeric',
                        month: 'long',
                    })}
                </p>
                {assignment.description && <p className="mt-2 text-sm text-muted-foreground">{assignment.description}</p>}
            </div>

            {/* Attachments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignment.attachments.map((file) => (
                    <Card key={file.attachmentId} className="hover:shadow-md transition">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium truncate">{file.title}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {file.contentType.split('/')[1].toUpperCase()} • {file.metadata?.size}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                                <a href="#" download>
                                    <Download className="w-4 h-4" />
                                    Tải xuống
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
