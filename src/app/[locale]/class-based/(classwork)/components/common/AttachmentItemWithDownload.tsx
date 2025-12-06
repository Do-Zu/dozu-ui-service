import React from 'react';
import { FileText, FileImage, FileSpreadsheet, FileArchive, File, FileCode, FileType, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IAttachment } from '../../types/attachment.type';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import attachmentUtils from '../../utils/attachment.utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import Axios from '@/api/axios';

interface Props {
    attachment: IAttachment;
}

export default function AttachmentItemWithDownload({ attachment }: Props) {
    const fileName = (attachment.metadata?.fileName || '') as string;
    const ext = fileName ? fileName.split('.').pop()?.toLowerCase() : '';

    function getIcon() {
        if (!ext) return <File className="h-6 w-6 text-gray-500" />;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FileImage className="h-6 w-6 text-blue-500" />;
        if (['pdf'].includes(ext)) return <FileText className="h-6 w-6 text-red-500" />;
        if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
        if (['zip', 'rar', '7z'].includes(ext)) return <FileArchive className="h-6 w-6 text-yellow-500" />;
        if (['js', 'ts', 'json', 'html', 'css'].includes(ext)) return <FileCode className="h-6 w-6 text-purple-500" />;
        return <FileType className="h-6 w-6 text-gray-500" />;
    }

    const handleDownload = async (file: IAttachment) => {
        console.log('file', file);
        if (!file.fileUrl) {
            toast({
                variant: 'destructive',
                title: 'Download failed',
                description: 'File URL is missing.',
            });
            return;
        }
        try {
            const response = await Axios.get(file.fileUrl, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.metadata?.originalName || file.title);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Download failed',
                description: '',
            });
        }
    };

    return (
        <Card key={attachment.attachmentId} className="hover:shadow-md transition">
            <CardHeader>
                <CardTitle className="text-base font-medium truncate">{attachment.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {attachmentUtils.formatContentType(attachment.contentType) ?? 'Unknown type'} •
                    {attachment.metadata?.fileSize} bytes
                </p>
            </CardHeader>
            <CardContent>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handleDownload(attachment)}
                >
                    <Download className="w-4 h-4" />
                    Download
                </Button>
            </CardContent>
        </Card>
    );
}
