import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import usePost from '@/hooks/usePost';
import imageService, { ImageUploadPayload } from '@/services/image/image.service';
import toastHelper from '@/utils/toast.helper';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';

interface Props {
    onUploadSuccess?: (data: string) => void;
}

export default function UploadTab({ onUploadSuccess }: Props) {
    const tCommon = useTranslations('common');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { loading: uploadImageLoading, execute: uploadImageAsync } = usePost<ImageUploadPayload, string>(
        imageService.uploadImage,
        'POST',
        {
            onSuccess(data) {
                onUploadSuccess?.(data);
            },
            onError(error) {
                toastHelper.showErrorMessage(error);
            },
        },
    );

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setImageFile(file);
        }
    }

    async function handleUploadClick() {
        if (!imageFile) {
            toastHelper.showErrorMessage('Please choose an image file before submit.');
            return;
        }
        await uploadImageAsync({ file: imageFile });
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div>
                <Button onClick={handleUploadClick} disabled={uploadImageLoading} variant="outline">
                    {uploadImageLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <div>{tCommon('actions.save')}</div>
                    )}
                </Button>
            </div>
        </div>
    );
}
