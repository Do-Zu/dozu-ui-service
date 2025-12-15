import ReactPlayer from 'react-player';
import {
    MediaController,
    MediaControlBar,
    MediaTimeRange,
    MediaTimeDisplay,
    MediaVolumeRange,
    MediaPlaybackRateButton,
    MediaPlayButton,
    MediaSeekBackwardButton,
    MediaSeekForwardButton,
    MediaMuteButton,
    MediaFullscreenButton,
} from 'media-chrome/react';
import { RefObject } from 'react';

export default function VideoPlayer({ url, playerRef }: { url: string; playerRef: RefObject<HTMLVideoElement> }) {
    return (
        <MediaController
            style={{
                width: '100%',
                aspectRatio: '10/9',
            }}
        >
            <ReactPlayer
                ref={playerRef}
                slot="media"
                src={url}
                controls={false}
                style={{
                    width: '100%',
                    height: '100%',
                }}
            ></ReactPlayer>
            <MediaControlBar>
                <MediaPlayButton />
                <MediaSeekBackwardButton seekOffset={10} />
                <MediaSeekForwardButton seekOffset={10} />
                <MediaTimeRange />
                <MediaTimeDisplay showDuration />
                <MediaMuteButton />
                <MediaVolumeRange />
                <MediaPlaybackRateButton />
                <MediaFullscreenButton />
            </MediaControlBar>
        </MediaController>
    );
}
