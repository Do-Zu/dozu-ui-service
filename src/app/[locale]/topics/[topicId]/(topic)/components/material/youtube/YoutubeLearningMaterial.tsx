import { Fragment, useEffect, useRef } from 'react';
import TranscriptViewer from '../common/transcript/TranscriptViewer';
import { YouTubeProps } from 'react-youtube';
import YoutubePlayer from './YoutubePlayer';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { isNilOrEmpty } from '@/utils';
import { ITranscriptSegment } from '../../../types';
import transcriptUtils from '../../../utils/transcript.utils';
import SelectMenu from '../SelectMenu';
import { YoutubePlayerAdapter } from '../../../media/core/youtube/YoutubePlayerAdapter';

interface Props {
    videoId: string;
    content: ITranscriptSegment[];
}

export default function YoutubeLearningMaterial({ videoId, content }: Props) {
    const { contentTextOrigin, registerPlayer, seekTo } = useTopicWorkspace();
    const { selectingContentText } = useTopicWorkspace();
    const ref = useRef<HTMLDivElement | null>(null);

    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        event.target.pauseVideo();
        registerPlayer(new YoutubePlayerAdapter(event.target));
    };

    useEffect(() => {
        if (!isNilOrEmpty(content)) {
            if (transcriptUtils.validateTranscript(content)) {
                contentTextOrigin.current = content.map((segment) => segment.text).join(' ');
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
            <Fragment>
                <SelectMenu refNode={ref} />
                <TranscriptViewer transcript={content} onSegmentClick={onSegmentClick} ref={ref} />
            </Fragment>
        </div>
    );
}
