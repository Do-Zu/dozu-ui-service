import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';
import AttachmentItem from '../../../(assignment)/components/AttachmentItem';


interface Props {
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    content: string;
    setContent: React.Dispatch<React.SetStateAction<string>>;
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export default function ContentSection({ title, setTitle, content, setContent, files, setFiles }: Props) {
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
                        Tiêu đề
                    </Label>
                    <Input
                        id="title"
                        placeholder="Nhập tiêu đề bài tập"
                        className="mt-2 text-base h-11"
                        value={title}
                        onChange={handleTitleChange}
                    />
                </div>
                <div>
                    <Label htmlFor="content" className="text-base">
                        Nội dung
                    </Label>
                    <Textarea
                        id="content"
                        placeholder="Nhập nội dung hoặc hướng dẫn chi tiết (không bắt buộc)"
                        className="mt-2 min-h-[200px] text-base"
                        value={content}
                        onChange={handleContentChange}
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-base">Tệp đính kèm</Label>
                    </div>

                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <AttachmentItem
                                key={index}
                                file={file}
                                onRemove={() => setFiles(files.filter((_, i) => i !== index))}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
