import React from 'react';
import { Link } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    url: string;
}

export default function UrlAttachmentItem({ url }: Props) {
    return (
        <div
            className={cn(
                'flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md',
            )}
        >
            <div className="flex items-center space-x-3 overflow-hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                    <Link className="h-6 w-6 text-gray-500" />
                </div>
                <div className="flex flex-col min-w-0">
                    <a
                        href={url}
                        target="_blank"
                        className="truncate text-sm font-medium text-foreground max-w-[220px]"
                    >
                        {url}
                    </a>
                    {/* <span className="text-xs text-muted-foreground uppercase">{ext || 'file'}</span> */}
                </div>
            </div>
        </div>
    );
}
