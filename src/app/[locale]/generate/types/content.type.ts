import { TranscriptSegment, VideoInfo } from '../stores/features/contentExtractionSlice';

export type YoutubeResourcePayload = {
    url: string;
    videoInfo: VideoInfo | null;
    content: string | null;
    lengthContent: number;
    transcriptSegments: TranscriptSegment[];
};

export type WebsiteResourcePayload = {
    url: string;
    content: string;
};

export type TextResourcePayload = {
    content: string;
};
