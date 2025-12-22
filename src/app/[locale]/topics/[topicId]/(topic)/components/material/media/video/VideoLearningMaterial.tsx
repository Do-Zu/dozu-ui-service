import React, { useEffect, useRef, useState } from 'react';
import { EnumLearningMaterial, ITranscriptSegment } from '../../../../types';
import SelectMenu from '../../SelectMenu';
import TranscriptViewer from '../../common/transcript/TranscriptViewer';
import { isNilOrEmpty, safeDestructure } from '@/utils';
import transcriptUtils from '../../../../utils/transcript.utils';
import { useTopicWorkspace } from '../../../../context/TopicWorkspaceContext';
import VideoPlayer from './VideoPlayer';
import { VideoPlayerAdapter } from '../../../../media/core/video/VideoPlayerAdapter';

interface IData {
    type: EnumLearningMaterial.media;
    blobUrl: string;
    file: File;
    content: ITranscriptSegment[];
}
interface IProps {
    data: IData;
}

export default function VideoLearningMaterial({ data }: IProps) {
    const [videoUrl, setVideoUrl] = useState<string>('');
    const { blobUrl, content } = safeDestructure(data);
    const ref = useRef<HTMLDivElement | null>(null);
    const { selectingContentText, contentTextOrigin, registerPlayer, seekTo } = useTopicWorkspace();
    const playerRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        registerPlayer(new VideoPlayerAdapter(playerRef));
    }, [registerPlayer]);

    useEffect(() => {
        const prevUrl = blobUrl;
        setVideoUrl(prevUrl);

        return () => {
            if (prevUrl) {
                URL.revokeObjectURL(prevUrl);
            }
        };
    }, [blobUrl]);

    useEffect(() => {
        if (!isNilOrEmpty(content) && transcriptUtils.validateTranscript(content)) {
            contentTextOrigin.current = content.map((segment) => segment.text).join(' ');
            return;
        }
        contentTextOrigin.current = '';
    }, [content]);

    function onSegmentClick(seconds: number) {
        if (selectingContentText) return;
        seekTo(seconds);
    }

    return (
        <div className="flex flex-col p-4 h-full gap-8">
            <VideoPlayer url={videoUrl} playerRef={playerRef} />
            <>
                <SelectMenu refNode={ref} />
                <TranscriptViewer transcript={content} onSegmentClick={onSegmentClick} ref={ref} />
            </>
        </div>
    );
}
