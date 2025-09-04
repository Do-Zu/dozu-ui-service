import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ICreateClassFeedBody } from '@/services/class-based-learning/classFeed.service';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useEffect, useState } from 'react';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    onSubmit: (feed: ICreateClassFeedBody) => void;
    loading?: boolean;
}

export default function CreateFeedModal({ isOpen, setIsOpen, onSubmit, loading }: Props) {
    const tCommon = useTranslations('common');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        setTitle('');
        setContent('');
    }, [isOpen]);

    function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
        setTitle(event.target.value);
    }

    function handleContentChange(event: ChangeEvent<HTMLInputElement>) {
        setContent(event.target.value);
    }

    function handleSubmit() {
        onSubmit({ title, content });
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Post an Announcement"
            body={
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="text-primary text-base font-normal">Title</div>
                        <Input value={title} onChange={handleTitleChange} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="text-primary text-base font-normal">Content</div>
                        <Input value={content} onChange={handleContentChange} />
                    </div>

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
