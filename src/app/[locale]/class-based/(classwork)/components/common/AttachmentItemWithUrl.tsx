import React from 'react';
import { Download, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
    url: string;
}

export default function AttachmentItemWithUrl({ url }: Props) {
    return (
        <Card key={url} className="hover:shadow-md transition">
            <CardHeader>
                <CardTitle className="text-base font-medium truncate">
                    {' '}
                    <a href={url!} target="_blank" rel="noopener noreferrer">
                        {url}
                    </a>
                    <p className="text-sm text-muted-foreground">{'     '} </p>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="outline" size="sm" asChild>
                    <Link href={url} className="flex items-center gap-2" target="_blank">
                        <LinkIcon className="w-4 h-4" />
                        Open
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
