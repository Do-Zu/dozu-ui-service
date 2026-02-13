export default interface MediaPlayerController {
    seekTo(seconds: number): void;
    play(): void;
    getCurrentTime(): number;
}
