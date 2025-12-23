import { useRef } from 'react';
import MediaPlayerController from '../../media/core/MediaPlayerController';

export default function useMediaPlayer() {
    const controllerRef = useRef<MediaPlayerController | null>(null);

    function registerPlayer(controller: MediaPlayerController) {
        controllerRef.current = controller;
    }

    function seekTo(seconds: number) {
        controllerRef.current?.seekTo(seconds);
    }

    function play() {
        controllerRef.current?.play();
    }

    return { registerPlayer, seekTo, play };
}
