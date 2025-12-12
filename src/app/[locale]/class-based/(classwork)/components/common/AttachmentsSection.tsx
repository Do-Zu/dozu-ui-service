import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useRef } from 'react';
import type { Dispatch, SetStateAction, ChangeEvent } from 'react';

import FileItem from './FileItem';

interface UrlData {
    title: string;
    link: string;
}

interface Props {
    files: File[];
    setFiles: Dispatch<SetStateAction<File[]>>;

    urls: string[];
    setUrls: Dispatch<SetStateAction<string[]>>;

    openUrlModal: () => void; // parent handles modal state
}

export default function AttachmentsSection({ files, setFiles, urls, setUrls, openUrlModal }: Props) {
    const tAttachment = useTranslations('attachment');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const selectedFiles = Array.from(event.target.files);
        setFiles((prev) => [...prev, ...selectedFiles]);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{tAttachment('attach')}</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                {/* Buttons */}
                <div className="flex flex-wrap gap-4">
                    <Button variant="outline" onClick={openUrlModal}>
                        <Link2 className="mr-2 h-4 w-4" /> {tAttachment('uploadUrl')}
                    </Button>

                    <Button variant="outline" onClick={handleUploadClick}>
                        <Upload className="mr-2 h-4 w-4" /> {tAttachment('uploadFile')}
                    </Button>

                    <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                </div>


            </CardContent>
        </Card>
    );
}
