import { Fragment, useEffect, useRef, useState } from 'react';
import TranscriptViewer from '../common/transcript/TranscriptViewer';
import { YouTubePlayer, YouTubeProps } from 'react-youtube';
import YoutubePlayer from './YoutubePlayer';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { isNilOrEmpty } from '@/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ITranscriptSegment } from '../../../types';
import transcriptUtils from '../../../utils/transcript.utils';
import SelectMenu from '../SelectMenu';

interface Props {
    videoId: string;
    content: string | ITranscriptSegment[];
}

export default function YoutubeLearningMaterial({ videoId, content }: Props) {
    const { contentTextOrigin, player, setPlayer, seekTo } = useTopicWorkspace();
    const { selectingContentText } = useTopicWorkspace();
    const ref = useRef<HTMLDivElement | null>(null);

    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        event.target.pauseVideo();
        setPlayer(event.target);
    };

    useEffect(() => {
        if (!isNilOrEmpty(content)) {
            if (typeof content === 'string') {
                contentTextOrigin.current = content;
            } else {
                if (transcriptUtils.validateTranscript(content)) {
                    contentTextOrigin.current = content.map((segment) => segment.text).join(' ');
                }
            }
        }
    }, [content]);

    function onSegmentClick(seconds: number) {
        if (selectingContentText) return;
        seekTo(seconds);
    }

    return (
        <div className="flex flex-col p-4 h-full">
            <YoutubePlayer videoId={videoId} onPlayerReady={onPlayerReady} />
            {typeof content === 'string' ? (
                <p>{content}</p>
            ) : (
                <Fragment>
                    <SelectMenu refNode={ref} />
                    <TranscriptViewer transcript={content} onSegmentClick={onSegmentClick} ref={ref} />
                </Fragment>
            )}
        </div>
    );
}
