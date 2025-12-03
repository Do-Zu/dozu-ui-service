import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ICreateTopicPayload } from '@/services/topic/topic.service';
import LoadingOverlay from '@/components/loading/LoadingOverLay';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    onSubmit: ({ name, description, imageFile }: ICreateTopicPayload) => void;
    loading?: boolean;
}

export function CreateTopicModal({ isOpen, setIsOpen, onSubmit, loading }: Props) {
    const tCommon = useTranslations('common');
    const tTopic = useTranslations('topic');
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [tempImageUrl, setTempImageUrl] = useState<string | null>();

    useEffect(() => {
        return () => {
            if (tempImageUrl) {
                URL.revokeObjectURL(tempImageUrl);
            }
        };
    }, [tempImageUrl]);

    useEffect(() => {
        setName('');
        setDescription('');
        setImageFile(null);
        setTempImageUrl(null);
    }, [isOpen]);

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setImageFile(file);
            const blogUrl = URL.createObjectURL(file);
            setTempImageUrl(blogUrl);
        }
    }

    function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
    }

    function handleDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
        setDescription(event.target.value);
    }

    function handleSubmit() {
        onSubmit({ name, description, imageFile });
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={tCommon('titles.createNew', { name: tTopic('topic') })}
            body={
                <div className="flex flex-col gap-4">
                    {loading && <LoadingOverlay />}

                    <div className="flex flex-col gap-2">
                        <div className="text-primary text-base font-normal">{tCommon('labels.name')}</div>
                        <Input value={name} onChange={handleNameChange} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="text-primary text-base font-normal">{tCommon('labels.description')}</div>
                        <Textarea value={description} onChange={handleDescriptionChange} />
                    </div>

                    {tempImageUrl ? (
                        <Image src={tempImageUrl} alt="Topic Image" width={200} height={200} unoptimized />
                    ) : null}
                    <Input type="file" onChange={handleFileChange} accept="image/*" />

                    <div>
                        <Button className="text-base" onClick={handleSubmit} disabled={loading}>
                            {loading ? tCommon('status.saving') : tCommon('actions.create')}
                        </Button>
                    </div>
                </div>
            }
        />
    );
}
