import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { ChangeEvent, useEffect, useState } from 'react';
import { ITopic } from '../types/topic.type';
import { IUpdateTopicPayload } from '@/services/topic/topic.service';

export type IUpdatingTopic = Pick<ITopic, 'topicId' | 'name' | 'description' | 'imageUrl'>;

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    topic?: IUpdatingTopic | null;
    onSubmit: ({ topicId, name, description, imageFile }: IUpdateTopicPayload) => void;
    loading?: boolean;
}

export function UpdateTopicModal({ isOpen, setIsOpen, topic, onSubmit, loading }: Props) {
    if (!topic) {
        return null;
    }
    const { topicId, name: nameSelected, description: descriptionSelected, imageUrl: imageUrlSelected } = topic;

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
        onSubmit({ topicId, name, description, imageFile });
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Update Topic"
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
                        <Image src={tempImageUrl} alt="Topic Image" width={200} height={200} unoptimized />
                    ) : null}
                    {!tempImageUrl && imageUrlSelected ? (
                        <Image src={imageUrlSelected} alt="Topic Image" width={200} height={200} />
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
