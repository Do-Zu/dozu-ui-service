import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { IAttachment } from '../../../types/attachment.type';

interface Props {
    attachments: IAttachment[];
}

export default function AttachmentsSection({ attachments }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachments.map((file) => (
                <Card key={file.attachmentId} className="hover:shadow-md transition">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium truncate">{file.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                            {file.contentType?.split?.('/')?.[1]?.toUpperCase() ?? 'UNKNOWN'} • {file.metadata?.size}
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
    );
}
