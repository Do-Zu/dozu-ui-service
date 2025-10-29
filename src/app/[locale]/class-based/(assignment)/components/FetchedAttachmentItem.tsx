import React from 'react';
import { FileText, FileImage, FileSpreadsheet, FileArchive, File, FileCode, FileType } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IAttachment } from '../../(classwork)/types/attachment.type';

interface Props {
    attachment: IAttachment;
}

export default function FetchedAttachmentItem({ attachment }: Props) {
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

    return (
        <div
            className={cn(
                'flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md',
            )}
        >
            <div className="flex items-center space-x-3 overflow-hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">{getIcon()}</div>
                <div className="flex flex-col min-w-0">
                    <span className="truncate text-sm font-medium text-foreground max-w-[220px]">
                        {fileName}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase">{ext || 'file'}</span>
                </div>
            </div>
        </div>
    );
}
