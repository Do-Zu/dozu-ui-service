import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, Upload } from 'lucide-react';
import { useRef } from 'react';

interface Props {
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export default function AttachmentsSection({ files, setFiles }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                <CardTitle className="text-lg">Đính kèm</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
                <Button variant="outline">
                    <Link2 className="mr-2 h-4 w-4" /> Liên kết
                </Button>
                <Button variant="outline" onClick={handleUploadClick}>
                    <Upload className="mr-2 h-4 w-4" /> Tải lên Tệp
                </Button>
                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
            </CardContent>
        </Card>
    );
}
