import { RefObject } from 'react';
import MediaPlayerController from '../MediaPlayerController';
import H5AudioPlayer from 'react-h5-audio-player';

export class AudioPlayerAdapter implements MediaPlayerController {
    private audioRef: RefObject<H5AudioPlayer | null>;
    constructor(audioRef: RefObject<H5AudioPlayer | null>) {
        this.audioRef = audioRef;
    }

    seekTo(seconds: number): void {
        const audio = this.audioRef.current?.audio.current;
        if (audio) {
            audio.currentTime = seconds;
            audio.play();
        }
    }

    play(): void {
        const audio = this.audioRef.current?.audio.current;
        if (audio) {
            audio.play();
        }
    }
}
