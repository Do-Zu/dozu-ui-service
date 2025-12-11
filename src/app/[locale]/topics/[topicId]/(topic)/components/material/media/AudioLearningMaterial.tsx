import { isNilOrEmpty, safeDestructure } from '@/utils';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import SelectMenu from '../SelectMenu';
import TranscriptViewer from '../youtube/TranscriptViewer';
import { EnumLearningMaterial, ITranscriptSegment } from '../../../types';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import transcriptUtils from '../../../utils/transcript.utils';

interface IData {
    type: EnumLearningMaterial.media;
    blobUrl: string;
    file: File;
    content: ITranscriptSegment[];
}
interface IProps {
    data: IData;
}

export default function AudioLearningMaterial({ data }: IProps) {
    const [audioUrl, setAudioUrl] = useState<string>('');
    const { blobUrl, content } = safeDestructure(data);
    const ref = useRef<HTMLDivElement | null>(null);
    const { selectingContentText, contentTextOrigin } = useTopicWorkspace();

    useEffect(() => {
        const prevUrl = blobUrl;
        setAudioUrl(prevUrl);

        return () => {
            if (prevUrl) {
                URL.revokeObjectURL(prevUrl);
            }
        };
    }, [blobUrl]);

    useEffect(() => {
        if (!isNilOrEmpty(content)) {
            if (transcriptUtils.validateTranscript(content)) {
                contentTextOrigin.current = content.map((segment) => segment.text).join(' ');
            }
        }
    }, [content]);

    function onSegmentClick(seconds: number) {
        if (selectingContentText) return;
    }

    return (
        <div className="flex flex-col p-4 h-full gap-8">
            <AudioPlayer src={audioUrl} />
            <Fragment>
                <SelectMenu refNode={ref} />
                <TranscriptViewer transcript={content} onSegmentClick={onSegmentClick} ref={ref} />
            </Fragment>
        </div>
    );
}
