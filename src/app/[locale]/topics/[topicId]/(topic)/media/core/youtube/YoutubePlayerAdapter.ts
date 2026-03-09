import { YouTubePlayer } from 'react-youtube';
import MediaPlayerController from '../MediaPlayerController';

export class YoutubePlayerAdapter implements MediaPlayerController {
    private readonly player: YouTubePlayer;
    constructor(player: YouTubePlayer) {
        this.player = player;
    }

    seekTo(seconds: number): void {
        this.player.seekTo(seconds, true);
        this.player.playVideo();
    }

    play(): void {
        this.player.playVideo();
    }

    getCurrentTime(): number {
        return this.player.getCurrentTime() || 0;
    }
}
