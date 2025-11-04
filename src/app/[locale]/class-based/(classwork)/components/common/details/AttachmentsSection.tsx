import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { IAttachment } from '../../../types/attachment.type';
import attachmentUtils from '../../../utils/attachment.utils';

interface Props {
    attachments?: IAttachment[];
}

export default function AttachmentsSection({ attachments }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachments?.map((file) => (
                <Card key={file.attachmentId} className="hover:shadow-md transition">
                    <CardHeader>
                        <CardTitle className="text-base font-medium truncate">{file.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {attachmentUtils.formatContentType(file.contentType) ?? 'Unknown type'} •
                            {file.metadata?.fileSize} bytes
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
