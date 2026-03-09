import { RefObject } from 'react';
import MediaPlayerController from '../MediaPlayerController';

export class VideoPlayerAdapter implements MediaPlayerController {
    private readonly playerRef: RefObject<HTMLVideoElement | null>;
    constructor(playerRef: RefObject<HTMLVideoElement | null>) {
        this.playerRef = playerRef;
    }

    seekTo(seconds: number): void {
        if (this.playerRef.current) {
            this.playerRef.current.currentTime = seconds;
            this.playerRef.current.play();
        }
    }

    play(): void {
        if (this.playerRef.current) {
            this.playerRef.current.play();
        }
    }

    getCurrentTime(): number {
        return this.playerRef.current?.currentTime || 0;
    }
}
