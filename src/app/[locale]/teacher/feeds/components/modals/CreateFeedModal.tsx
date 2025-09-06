import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';
import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ICreateClassFeedBody } from '@/services/class-based-learning/classFeed.service';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useEffect, useState } from 'react';

export type IDefaultFeed = Pick<IClassFeed, 'title' | 'content' | 'link'>;

interface BaseProps {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    onSubmit: (feed: ICreateClassFeedBody) => void;
    loading?: boolean;
    defaultFeed?: IDefaultFeed | null;
}

interface CustomFeedProps {
    type: 'custom';
}

interface SystemFeedProps {
    type: 'system';
    onCancel: () => void;
}

type Props = BaseProps & (CustomFeedProps | SystemFeedProps);

export default function CreateFeedModal(props: Props) {
    const { isOpen, setIsOpen, onSubmit, loading, defaultFeed, type } = props;
    const tCommon = useTranslations('common');
    const [title, setTitle] = useState(defaultFeed?.title || '');
    const [content, setContent] = useState(defaultFeed?.content || '');
    const [link, setLink] = useState(defaultFeed?.link || '');

    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setContent('');
            setLink('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!defaultFeed) {
            return;
        }

        setTitle(defaultFeed.title);
        setContent(defaultFeed.content);
        setLink(defaultFeed.link || '');
    }, [defaultFeed]);

    function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
        setTitle(event.target.value);
    }

    function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
        setContent(event.target.value);
    }

    function handleLinkChange(event: ChangeEvent<HTMLInputElement>) {
        setLink(event.target.value);
    }

    function handleSubmit() {
        onSubmit({ title, content, link });
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
                        <Textarea value={content} onChange={handleContentChange} />
                    </div>

                    {link.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            <div className="text-primary text-base font-normal">Link</div>
                            <Input value={link} onChange={handleLinkChange} disabled />
                        </div>
                    ) : null}

                    <div className="flex flex-row gap-2">
                        {type === 'system' ? (
                            <Button className="text-base" onClick={props.onCancel}>
                                No, skip for now
                            </Button>
                        ) : null}
                        <Button className="text-base" onClick={handleSubmit} disabled={loading}>
                            {loading
                                ? tCommon('status.saving')
                                : type === 'custom'
                                  ? tCommon('actions.create')
                                  : 'Yes, share it now'}
                        </Button>
                    </div>
                </div>
            }
            description={
                type === 'system'
                    ? 'Let your class know about the new learning content! Would you like to create a feed now?'
                    : null
            }
        />
    );
}
