'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useActionStore } from './context/ActionContext';
import usePost from '@/hooks/usePost';
import useFetch from '@/hooks/useFetch';
import { resourceService } from './services/contentCreation.service';
import { Link as LinkIcon, Loader } from 'lucide-react';
import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isEmpty, safeDestructure } from '@/utils';
import { isYouTubeUrl, validateUrl } from './helper/helper';
import LoadingOverlay from '@/components/loading/LoadingOverLay';
import { YoutubeResourcePayload } from './types/resource.type';
import { IMPORT_METHOD, RESOURCE_CONTENT_TYPE, ResourceContentType } from './constants/resource';
import { toast } from 'sonner';

interface RequestTopicResourceRequest {
    name: string;
    description: string;
    contentType: ResourceContentType;
    payloadMetaData: YoutubeResourcePayload;
}

interface ResponseUploadContent {
    topicId: number;
}
interface IParamFetchYoutubeInfo {
    pastedUrl: string;
}

const renderProgress = (message: string, isProcessing = true) => (
    <div className="flex items-center gap-2">
        {isProcessing && <Loader className="h-4 w-4 animate-spin" />}
        <span>{message}</span>
    </div>
);

export const PasteLinkModal: React.FC = () => {
    const {
        showLink: isOpen,
        setShowLink: setIsOpen,
        redirectTopicWorkspace,
        setProcessingType,
        isProcessing,
    } = useActionStore((state) => state);
    const [inputUrl, setInputUrl] = useState<string>('');
    const uploadToastIdRef = React.useRef<string | number | undefined>();

    const { execute: uploadResource } = usePost<RequestTopicResourceRequest, ResponseUploadContent>(
        async (payload) => await resourceService.createTopicContent(payload),
        'POST',
        {
            onBefore: () => {
                uploadToastIdRef.current = toast(renderProgress('Processing Content...'), {
                    duration: Infinity,
                });
            },
            onSuccess: ({ topicId }) => {
                redirectTopicWorkspace(topicId);
                toast.info('Ready! Redirecting to workspace...', {
                    duration: 2000,
                });
            },
            onAfter: () => {
                toast.dismiss(uploadToastIdRef.current);
                uploadToastIdRef.current = undefined;

                setProcessingType(null);
                setIsOpen(false);
            },
            onError: (error) => {
                const message = (error as unknown as Error).message || 'Fail upload resource';

                toast.error(message, {
                    duration: 2000,
                });
            },
        },
    );

    const { refetch: getVideoInfo } = useFetch<YoutubeResourcePayload>(
        async (payload: IParamFetchYoutubeInfo) => await resourceService.handleGetInfoVideo(payload),
        {
            shouldRun: false,
            onSuccess: (video: YoutubeResourcePayload) => {
                if (isEmpty(video)) return;

                const DEFAULT_TITLE = '';

                const { title } = safeDestructure(video?.videoInfo, { title: DEFAULT_TITLE });

                uploadResource({
                    name: title,
                    description: '',
                    contentType: RESOURCE_CONTENT_TYPE.YOUTUBE as ResourceContentType,
                    payloadMetaData: video,
                });
            },
            onError: () => {
                setProcessingType(null);
                const message =
                    'Failed to fetch transcript. This video might not have captions available or might be private.';

                toast.error(message, {
                    duration: 2000,
                });
            },
            onBefore: () => {
                setProcessingType(IMPORT_METHOD.TEXT);
                uploadToastIdRef.current = toast(renderProgress('Get video info'), {
                    duration: Infinity,
                });
            },
            onAfter: () => {
                toast.dismiss(uploadToastIdRef.current);
                uploadToastIdRef.current = undefined;
            },
        },
    );

    const handleChangeInputUrl = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputUrl(e.target.value);
    }, []);

    const handleUrlOnPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();

        const pastedUrl = e.clipboardData.getData('text').trim();

        if (!validateUrl(pastedUrl)) {
            toast.error('Invalid Link');
            setInputUrl('');
            return;
        }

        setInputUrl(pastedUrl);

        await handleProcessingUrl(pastedUrl);
    };

    const handleProcessingUrl = async (pastedUrl: string) => {
        if (isYouTubeUrl(pastedUrl)) {
            await getVideoInfo({ pastedUrl });
        } else {
            toast('Feature is coming soon');
        }
    };

    const clearState = () => {
        setInputUrl('');
        uploadToastIdRef.current = undefined;
    };

    useEffect(() => {
        if (!isOpen) {
            clearState();
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            className="max-w-[400px]"
            body={
                <div className="flex flex-col gap-6 ">
                    {isProcessing() && <LoadingOverlay />}

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <LinkIcon className="w-4 h-4" />
                            <span>YouTube, Website</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Paste a YouTube Link , Website URL</p>
                        <Input
                            onPaste={handleUrlOnPaste}
                            onChange={handleChangeInputUrl}
                            value={inputUrl}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="bg-background"
                        />
                    </div>
                </div>
            }
            footer={
                <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={() => handleProcessingUrl(inputUrl)} disabled={isEmpty(inputUrl)}>
                        Continue
                    </Button>
                </div>
            }
            contentStyle="top-[30%] left-[50%] max-w-[40vw] -translate-x-1/2 -translate-y-0"
        />
    );
};
