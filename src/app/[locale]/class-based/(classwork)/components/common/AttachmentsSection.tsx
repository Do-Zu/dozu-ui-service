import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useRef } from 'react';
import type { Dispatch, SetStateAction, ChangeEvent } from 'react';

interface Props {
    files: File[];
    setFiles: Dispatch<SetStateAction<File[]>>;
}

export default function AttachmentsSection({ files, setFiles }: Props) {
    const tAttachment = useTranslations('attachment');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const selectedFiles = Array.from(event.target.files);
        const allFiles = selectedFiles.concat(files);
        setFiles(allFiles);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{tAttachment('attach')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
                <Button variant="outline">
                    <Link2 className="mr-2 h-4 w-4" /> {tAttachment('uploadUrl')}
                </Button>
                <Button variant="outline" onClick={handleUploadClick}>
                    <Upload className="mr-2 h-4 w-4" /> {tAttachment('uploadFile')}
                </Button>
                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
            </CardContent>
        </Card>
    );
}
