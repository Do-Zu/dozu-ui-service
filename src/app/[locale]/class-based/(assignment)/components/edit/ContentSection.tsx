import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

interface Props {
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    content: string;
    setContent: React.Dispatch<React.SetStateAction<string>>;
}

export default function ContentSection({ title, setTitle, content, setContent }: Props) {
    function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setTitle(e.target.value);
    }

    function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setContent(e.target.value);
    }

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
            </CardContent>
        </Card>
    );
}
