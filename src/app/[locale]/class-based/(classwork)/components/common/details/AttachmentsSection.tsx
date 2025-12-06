import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { IAttachment } from '../../../types/attachment.type';
import attachmentUtils from '../../../utils/attachment.utils';
import Axios from '@/api/axios';
import { toast } from '@/hooks/use-toast';
import AttachmentItemWithDownload from '../AttachmentItemWithDownload';

interface Props {
    attachments?: IAttachment[];
}

export default function AttachmentsSection({ attachments }: Props) {
    const handleDownload = async (file: IAttachment) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachments?.map((file) => <AttachmentItemWithDownload attachment={file} />)}
        </div>
    );
}
