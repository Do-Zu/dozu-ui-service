import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';
import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useEffect, useState } from 'react';

export type IUpdatingFeed = Pick<IClassFeed, 'classFeedId' | 'title' | 'content' | 'link'>;

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    feed?: IUpdatingFeed | null;
    onSubmit: (feed: IUpdatingFeed) => void;
    loading?: boolean;
}

export default function UpdateFeedModal({ isOpen, setIsOpen, feed, onSubmit, loading }: Props) {
    if (!feed) {
        return null;
    }
    const { classFeedId, title: titleSelected, content: contentSelected, link } = feed;
    const tCommon = useTranslations('common');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setContent('');
        } else {
            setTitle(titleSelected);
            setContent(contentSelected);
        }
    }, [isOpen, titleSelected, contentSelected]);

    function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
        setTitle(event.target.value);
    }

    function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
        setContent(event.target.value);
    }

    function handleSubmit() {
        onSubmit({ classFeedId, title, content });
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Update a feed"
            body={
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="text-primary text-base font-normal">Title</div>
                        <Input value={title} onChange={handleTitleChange} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="text-primary text-base font-normal">Content</div>
                        <Textarea value={content} onChange={handleContentChange} />
                    </div>

                    <div>
                        <Button className="text-base" onClick={handleSubmit} disabled={loading}>
                            {loading ? tCommon('status.saving') : tCommon('actions.update')}
                        </Button>
                    </div>
                </div>
            }
        />
    );
}
