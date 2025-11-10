import { useState } from 'react';
import { ITranscriptSegment } from '../../../service/learningMaterial.service';
import TranscriptViewer from './TranscriptViewer';
import { YouTubePlayer, YouTubeProps } from 'react-youtube';
import YoutubePlayer from './YoutubePlayer';

interface Props {
    videoId: string;
    content: string | ITranscriptSegment[];
}

export default function YoutubeLearningMaterial({ videoId, content }: Props) {
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

    return (
        <div className="flex flex-col gap-4 p-8 overflow-y-scroll">
            <YoutubePlayer videoId={videoId} onPlayerReady={onPlayerReady} />
            {typeof content === 'string' ? (
                <p>{content}</p>
            ) : (
                <TranscriptViewer transcript={content} onSegmentClick={seekTo} />
            )}
        </div>
    );
}
