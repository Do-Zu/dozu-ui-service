import ReactYoutube, { YouTubeEvent } from 'react-youtube';

interface Props {
    videoId: string;
    onPlayerReady: (event: YouTubeEvent<any>) => void;
}

export default function YoutubePlayer({ videoId, onPlayerReady }: Props) {
    return (
        <div className="relative w-full aspect-video">
            <ReactYoutube
                videoId={videoId}
                className="absolute inset-0 w-full h-full"
                opts={{ width: '100%', height: '100%' }}
                onReady={onPlayerReady}
            />
        </div>
    );
}
