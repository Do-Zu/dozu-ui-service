import { useState } from 'react';
import { YouTubePlayer } from 'react-youtube';

export default function useYoutubePlayer() {
    const [player, setPlayer] = useState<YouTubePlayer | null>(null);

    const seekTo = (seconds: number) => {
        if (player) {
            player.seekTo(seconds, true);
            player.playVideo();
        }
    };

    return {
        player,
        setPlayer,
        seekTo,
    };
}
