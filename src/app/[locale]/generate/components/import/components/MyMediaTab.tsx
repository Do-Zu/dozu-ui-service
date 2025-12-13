'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { Loader2, Mic, SendHorizonal, Video, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
    ALLOWED_AUDIO_TYPES,
    ALLOWED_VIDEO_TYPES,
    MAX_MEDIA_SIZE_MB,
    validateFileSize,
    validateMediaType,
} from '../../../helper/validate';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useNavigation from '@/hooks/useNavigation';
import topicService from '@/services/topic/topic.service';
import uploadService from '@/services/upload';
import { isNilOrEmpty } from '@/utils';
import { ContentCreationService, MediaResourceMetadata } from '../../../services/contentCreation.service';
import { RESOURCE_CONTENT_TYPE } from '../../../constants/resource';
import audioTranscriptionService from '@/app/[locale]/topics/[topicId]/(topic)/service/audioTranscription.service';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { ICreateTopicResponse } from '@/app/[locale]/topics/types/topic.type';

const MediaTab: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File>();

    const audioInputRef = useRef<HTMLInputElement>(null);
    const { navigateToTopicPage } = useNavigation();

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleMediaDrop = (e: React.DragEvent<HTMLDivElement>, mediaType: 'audio' | 'video') => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0]; // Only take the first file for media

            if (!validateMediaType(file, mediaType) || !validateFileSize(file, true)) {
                toast({
                    title: `Invalid ${mediaType} file`,
                    description: `Only ${mediaType === 'audio' ? ALLOWED_AUDIO_TYPES.join(', ') : ALLOWED_VIDEO_TYPES.join(', ')} files up to ${MAX_MEDIA_SIZE_MB}MB are allowed.`,
                    variant: 'destructive',
                });
                return;
            }

            setSelectedFile(file);
            // dispatch(setFiles([file]));
            // dispatch(setImportMethod('media'));
        }
    };

    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            if (!validateMediaType(file, 'audio') || !validateFileSize(file, true)) {
                toast({
                    title: 'Invalid audio file',
                    description: `Only ${ALLOWED_AUDIO_TYPES.join(', ')} files up to ${MAX_MEDIA_SIZE_MB}MB are allowed.`,
                    variant: 'destructive',
                });
                e.target.value = '';
                return;
            }

            setSelectedFile(file);
            // dispatch(setFiles([file]));
            // dispatch(setImportMethod('media'));
        }
    };

    function handleAudioClick() {
        audioInputRef.current?.click();
    }

    const { loading: isLoading, execute } = usePost<File, ICreateTopicResponse>(
        async (audioFile: File) => {
            // step 1: create new topic using name from selected file
            const topic = await topicService.createTopic({ name: audioFile.name ?? '', description: '' });

            // step 2: upload file
            const fileInfo = await uploadService.uploadFile(audioFile);
            if (isNilOrEmpty(fileInfo)) {
                throw new Error('File upload failed');
            }

            // step 3: get audio transcript segments
            const transcriptSegments = await audioTranscriptionService.getTranscripSegmentsFromAudio({
                audioFile,
            });

            // step 4: insert input set
            const payload: MediaResourceMetadata = { ...fileInfo, content: transcriptSegments };

            await ContentCreationService.insertContentTopic({
                topicId: topic.topicId,
                contentType: RESOURCE_CONTENT_TYPE.MEDIA,
                payload,
            });

            return topic;
        },
        'POST',
        {
            onError(error) {
                console.error(error);
                toastHelper.showErrorMessage('Failed to process your media file. Please try again.');
            },
            onSuccess(data) {
                toastHelper.showSuccessMessage('Upload and process successfully. Redirecting to your topic page..');

                // step 5: navigate to topic page
                navigateToTopicPage({ topicId: data.topicId });
            },
        },
    );

    async function handleSubmitClick() {
        if (!selectedFile) return;
        await execute(selectedFile);
    }

    // const selectedFile = files[0];
    return (
        <div className="p-4 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
                <div
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:opacity-70 transition-colors cursor-pointer col-span-2"
                    onClick={handleAudioClick}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleMediaDrop(e, 'audio')}
                >
                    <Input
                        ref={audioInputRef}
                        id="audio-upload"
                        type="file"
                        className="hidden"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                    />
                    <Mic className="h-8 w-8 mx-auto mb-3" />
                    <h3 className="font-medium text-sm mb-1">Upload Audio</h3>
                    <p className="text-xs">
                        Supports for {ALLOWED_AUDIO_TYPES.join(', ')} files (max {MAX_MEDIA_SIZE_MB}MB)
                    </p>
                </div>
            </div>

            {selectedFile && (
                <div>
                    <h4 className="text-sm font-medium mb-2">Selected file:</h4>
                    <div className="text-sm flex items-center justify-between">
                        <div className="flex items-center">
                            <Mic className="h-4 w-4 mr-2" />
                            {selectedFile.name}
                            <span className="ml-2 text-xs text-gray-500">
                                ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <Button onClick={handleSubmitClick} disabled={isLoading}>
                    {!isLoading ? (
                        <>
                            Submit
                            <SendHorizonal className="h-4 w-4 ml-2" />
                        </>
                    ) : (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin"></Loader2>
                            Uploading...
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default memo(MediaTab);
