import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, Upload } from 'lucide-react';

export default function AttachmentsSection() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Đính kèm</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
                <Button variant="outline">
                    <Link2 className="mr-2 h-4 w-4" /> Liên kết
                </Button>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Tải lên Tệp
                </Button>
            </CardContent>
        </Card>
    );
}
