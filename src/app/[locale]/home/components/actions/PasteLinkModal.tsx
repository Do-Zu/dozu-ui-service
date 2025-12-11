'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link as LinkIcon, Loader } from 'lucide-react';
import { useActionStore } from './context/ActionContext';
import { toast } from 'sonner';
import { countWords, isEmpty, safeDestructure } from '@/utils';
import axios from 'axios';
import { STATUS_CODE } from '@/utils/constants/http';
import { InsertContentTopicParams, YoutubeResourcePayload } from './types/resource.type';
import { extractYouTubeVideoId } from './helper/helper';
import useFetch from '@/hooks/useFetch';
import LoadingOverlay from '@/components/loading/LoadingOverLay';
import usePost from '@/hooks/usePost';
import topicService from '@/services/topic/topic.service';
import { resourceService } from './services/contentCreation.service';
import { IMPORT_METHOD, RESOURCE_CONTENT_TYPE, ResourceContentType } from './constants/resource';

export const BASE_API_YOUTUBE = '/api/youtube/transcript?videoId=';
export const BASE_API_EXTRACT_WEBSITE = '/api/website-content';

interface RequestTopicResourceRequest {
    name: string;
    description: string;
    contentType: ResourceContentType;
    payloadMetaData: YoutubeResourcePayload;
}

interface ResponseUploadContent {
    topicId: number;
}

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

    const {
        loading: isFetchingVideoInfo,
        data: video,
        error: errorFetchingVideo,
        refetch: getVideoInfo,
    } = useFetch<YoutubeResourcePayload>(({ pastedUrl }) => handleGetInfoVideo({ pastedUrl }), {
        shouldRun: false,
        onSuccess: () => {
            toast.dismiss();
        },
        onError: () => {
            setProcessingType(null);
        },
    });

    const {
        loading: isUploadResource,
        error: errorUploadResource,
        data: resourceResponse,
        execute: uploadResource,
    } = usePost<RequestTopicResourceRequest, ResponseUploadContent>((payload) => handleCreateTopic(payload), 'POST', {
        onError: (error) => {
            const message = (error as unknown as Error).message || 'Fail upload resource';

            toast.error(message, {
                duration: 2000,
            });
        },
    });

    const isYouTubeUrl = (url: string): boolean => {
        return !isEmpty(extractYouTubeVideoId(url));
    };

    const handleCreateTopic = async ({
        name,
        description = '',
        contentType,
        payloadMetaData,
    }: {
        name: string;
        description: string;
        contentType: ResourceContentType;
        payloadMetaData: YoutubeResourcePayload;
    }) => {
        try {
            const { topicId } = await topicService.createTopic({
                name,
                description,
            });

            const payload = {
                topicId,
                contentType,
                payload: payloadMetaData,
            } as InsertContentTopicParams;

            await resourceService.insertContentTopic(payload);

            return { topicId };
        } catch (error) {
            const message = (error as unknown as Error).message || 'Fail upload resource';

            toast.error(message, {
                duration: 2000,
            });
        }
    };

    const renderProgress = (message: string, isProcessing = true) => (
        <div className="flex items-center gap-2">
            {isProcessing && <Loader className="h-4 w-4 animate-spin" />}
            <span>{message}</span>
        </div>
    );

    const handleGetInfoVideo = async ({ pastedUrl }: { pastedUrl: string }) => {
        setProcessingType(IMPORT_METHOD.TEXT);

        const toastId = toast(renderProgress('Get video info'), {
            duration: Infinity,
        });

        try {
            const videoId = extractYouTubeVideoId(pastedUrl?.trim());

            if (isEmpty(videoId)) {
                toast.error('Invalid Link Video');
                return;
            }

            const { data, status } = await axios.get(`${BASE_API_YOUTUBE}${videoId}`);

            if (status !== STATUS_CODE.OK) {
                throw new Error(data.error || 'Failed to fetch transcript');
            }

            const { transcript, metadata: rawMetadata } = data;

            const metadata = rawMetadata ?? {};

            const youtubePayload: YoutubeResourcePayload = {
                url: pastedUrl,
                videoInfo: {
                    ...metadata,
                    videoId,
                },
                lengthContent: transcript.length,
                content: transcript || null,
                wordCount: countWords(transcript),
            };

            return youtubePayload;
        } catch (err) {
            const message =
                'Failed to fetch transcript. This video might not have captions available or might be private.';

            toast.error(message, {
                duration: 2000,
            });

            setProcessingType(null);
        } finally {
            toast.dismiss(toastId);
        }
    };

    const validateUrl = (pastedUrl: string): boolean => {
        const urlPattern =
            /^(https?:\/\/)?([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6})\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

        if (isEmpty(pastedUrl)) return false;

        return urlPattern.test(pastedUrl);
    };

    const handleChangeInputUrl = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputUrl(e.target.value);
    }, []);

    const handleUrlOnPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();

        const pastedUrl = e.clipboardData.getData('text').trim();

        if (!validateUrl(pastedUrl)) {
            toast.error('Invalid Link');
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
        if (isUploadResource) {
            uploadToastIdRef.current = toast(renderProgress('Processing Content...'), {
                duration: Infinity,
            });
            return;
        }

        if (!errorUploadResource && resourceResponse) {
            setIsOpen(false);

            const { topicId } = resourceResponse;

            redirectTopicWorkspace(topicId);
        }

        setProcessingType(null);

        toast.dismiss(uploadToastIdRef.current);
        uploadToastIdRef.current = undefined;
    }, [isUploadResource, errorUploadResource, resourceResponse]);

    useEffect(() => {
        if (!video || isFetchingVideoInfo || errorFetchingVideo) {
            return;
        }

        const { title } = safeDestructure(video?.videoInfo, {});

        uploadResource({
            name: title,
            description: '',
            contentType: RESOURCE_CONTENT_TYPE.YOUTUBE as ResourceContentType,
            payloadMetaData: video,
        });
    }, [video, isFetchingVideoInfo, errorFetchingVideo]);

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

                    {/* <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground">or</span>
                        <div className="flex-grow border-t border-border"></div>
                    </div> */}

                    {/* <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="w-4 h-4" />
                            <span>Paste Text</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Copy and paste text to add as content</p>
                        <Textarea
                            placeholder="Paste your notes here"
                            className="min-h-[120px] bg-background resize-none"
                        />
                    </div> */}
                </div>
            }
            footer={
                <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={() => handleProcessingUrl(inputUrl)}>Continue</Button>
                </div>
            }
        />
    );
};
