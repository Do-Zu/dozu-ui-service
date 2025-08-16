import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IUpdateClassPayload } from '@/services/class-based-learning/teacher/teacherClass.service';
import Image from 'next/image';
import { ChangeEvent, useEffect, useState } from 'react';

export type IUpdatingClass = Pick<IClass, 'classId' | 'name' | 'description' | 'imageUrl'>;

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    myClass?: IUpdatingClass | null;
    onSubmit: (data: IUpdateClassPayload) => void;
    loading?: boolean;
}

export function UpdateClassModal({ isOpen, setIsOpen, myClass, onSubmit, loading }: Props) {
    if (!myClass) {
        return null;
    }
    const { classId, name: nameSelected, description: descriptionSelected, imageUrl: imageUrlSelected } = myClass;

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
        if (!isOpen) {
            setName('');
            setDescription('');
            setImageFile(null);
            setTempImageUrl(null);
        } else {
            setName(nameSelected);
            setDescription(descriptionSelected);
            setImageFile(null);
        }
    }, [isOpen, nameSelected, descriptionSelected]);

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

    function handleDescriptionChange(event: ChangeEvent<HTMLInputElement>) {
        setDescription(event.target.value);
    }

    function handleSubmit() {
        onSubmit({ classId, name, description, imageFile });
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Update Class"
            body={
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="text-primary text-base font-normal">Name</div>
                        <Input value={name} onChange={handleNameChange} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="text-primary text-base font-normal">Description</div>
                        <Input value={description} onChange={handleDescriptionChange} />
                    </div>

                    {tempImageUrl ? (
                        <Image src={tempImageUrl} alt="Class Image" width={200} height={200} unoptimized />
                    ) : null}
                    {!tempImageUrl && imageUrlSelected ? (
                        <Image src={imageUrlSelected} alt="Class Image" width={200} height={200} />
                    ) : null}
                    <Input type="file" onChange={handleFileChange} accept="image/*" />

                    <div>
                        <Button className="text-base" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Saving...' : 'Update'}
                        </Button>
                    </div>
                </div>
            }
        />
    );
}
