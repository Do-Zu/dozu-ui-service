import { isNilOrEmpty, safeDestructure } from '@/utils';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import 'react-h5-audio-player/lib/styles.css';
import SelectMenu from '../SelectMenu';
import TranscriptViewer from '../common/transcript/TranscriptViewer';
import { EnumLearningMaterial, ITranscriptSegment } from '../../../types';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import transcriptUtils from '../../../utils/transcript.utils';
import H5AudioPlayer from 'react-h5-audio-player';
import { AudioPlayerAdapter } from '../../../media/core/audio/AudioPlayerAdapter';

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
    const { selectingContentText, contentTextOrigin, registerPlayer, seekTo } = useTopicWorkspace();
    const audioRef = useRef<H5AudioPlayer | null>(null);

    useEffect(() => {
        registerPlayer(new AudioPlayerAdapter(audioRef));
    }, []);

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
            <H5AudioPlayer src={audioUrl} ref={audioRef} />
            <Fragment>
                <SelectMenu refNode={ref} />
                <TranscriptViewer transcript={content} onSegmentClick={onSegmentClick} ref={ref} />
            </Fragment>
        </div>
    );
}
