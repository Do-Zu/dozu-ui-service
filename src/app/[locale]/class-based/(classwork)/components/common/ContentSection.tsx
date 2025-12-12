import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';
import FileItem from './FileItem';
import { IAttachment } from '../../types/attachment.type';
import AttachmentItem from './AttachmentItem';
import { useTranslations } from 'next-intl';
import type { Dispatch, SetStateAction } from 'react';
import UrlAttachmentItem from './UrlAttachmentItem';

interface Props {
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    content: string;
    setContent: React.Dispatch<React.SetStateAction<string>>;
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;

    attachments?: IAttachment[] | undefined;
    urlAttachments?: string[] | undefined;
    urls: string[];
    setUrls: Dispatch<SetStateAction<string[]>>;
}

export default function ContentSection({
    title,
    setTitle,
    content,
    setContent,
    files,
    setFiles,
    attachments,
    urlAttachments,
    urls,
    setUrls,
}: Props) {
    const tCommon = useTranslations('common');
    const tAttachment = useTranslations('attachment');
    const tClasswork = useTranslations('classwork');
    function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setTitle(e.target.value);
    }

    function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setContent(e.target.value);
    }

    // function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    //     if (e.target.files) {
    //         setFiles(Array.from(e.target.files));
    //     }
    // }

    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                <div>
                    <Label htmlFor="title" className="text-base">
                        {tCommon('labels.title')}
                    </Label>
                    <Input
                        id="title"
                        placeholder={tClasswork('titlePlaceholder')}
                        className="mt-2 text-base h-11"
                        value={title}
                        onChange={handleTitleChange}
                    />
                </div>
                <div>
                    <Label htmlFor="content" className="text-base">
                        {tCommon('labels.content')}
                    </Label>
                    <Textarea
                        id="content"
                        placeholder={tClasswork('contentPlaceholder')}
                        className="mt-2 min-h-[200px] text-base"
                        value={content}
                        onChange={handleContentChange}
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-base">{tAttachment('attachment')}</Label>
                    </div>

                    <div className="space-y-2">
                        {attachments?.map((attachment) => (
                            <AttachmentItem key={attachment.attachmentId} attachment={attachment} />
                        ))}
                        {urlAttachments?.map((u, i) => <UrlAttachmentItem key={i} url={u} />)}
                        {files.map((file, index) => (
                            <FileItem
                                key={index}
                                file={file}
                                onRemove={() => setFiles(files.filter((_, i) => i !== index))}
                            />
                        ))}
                        {urls?.map((u, i) => (
                            <FileItem
                                key={i}
                                title={'link'}
                                url={u}
                                onRemove={() => setUrls(urls.filter((_, idx) => idx !== i))}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
