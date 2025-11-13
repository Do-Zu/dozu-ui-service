import { useEffect, useState } from 'react';
import TranscriptViewer from './TranscriptViewer';
import { YouTubePlayer, YouTubeProps } from 'react-youtube';
import YoutubePlayer from './YoutubePlayer';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { isNilOrEmpty } from '@/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ITranscriptSegment } from '../../../types';
import transcriptUtils from '../../../utils/transcript.utils';

interface Props {
    videoId: string;
    content: string | ITranscriptSegment[];
}

export default function YoutubeLearningMaterial({ videoId, content }: Props) {
    const { contentTextOrigin, player, setPlayer, seekTo } = useTopicWorkspace();

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

    return (
        <ScrollArea className="flex flex-col p-4">
            <YoutubePlayer videoId={videoId} onPlayerReady={onPlayerReady} />
            {typeof content === 'string' ? (
                <p>{content}</p>
            ) : (
                <TranscriptViewer transcript={content} onSegmentClick={seekTo} />
            )}
        </ScrollArea>
    );
}
