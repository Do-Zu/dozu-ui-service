import { useEffect, useState } from 'react';
import { ITranscriptSegment } from '../../../service/learningMaterial.service';
import TranscriptViewer from './TranscriptViewer';
import { YouTubePlayer, YouTubeProps } from 'react-youtube';
import YoutubePlayer from './YoutubePlayer';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { isNilOrEmpty } from '@/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
    videoId: string;
    content: string | ITranscriptSegment[];
}

export default function YoutubeLearningMaterial({ videoId, content }: Props) {
    const { contentTextOrigin } = useTopicWorkspace();

    const [player, setPlayer] = useState<YouTubePlayer | null>(null);

    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        event.target.pauseVideo();
        setPlayer(event.target);
    };

    async function seekTo(seconds: number) {
        if (player) {
            await player.seekTo(seconds, true);
            await player.playVideo();
        }
    }

    useEffect(() => {
        if (!isNilOrEmpty(content)) {
            contentTextOrigin.current = content as string;
        }
    }, [content]);

    return (
        <ScrollArea className="flex flex-col gap-4 p-8">
            <YoutubePlayer videoId={videoId} onPlayerReady={onPlayerReady} />
            {typeof content === 'string' ? (
                <p>{content}</p>
            ) : (
                <TranscriptViewer transcript={content} onSegmentClick={seekTo} />
            )}
        </ScrollArea>
    );
}
