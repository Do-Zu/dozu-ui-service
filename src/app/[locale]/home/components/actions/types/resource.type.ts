import { UploadFileResponse } from '@/components/generative/types';

import { RESOURCE_CONTENT_TYPE } from '../constants/resource';
import { ITranscriptSegment } from '@/app/[locale]/topics/[topicId]/(topic)/types';

interface IEmbedVideoInfo {
    iframe_url: string;
    flash_url: string;
    flash_secure_url: string;
    width: number;
    height: number;
}
export interface VideoInfo {
    title: string;
    thumbnailUrl?: string;
    videoId?: string;
    embed?: IEmbedVideoInfo;
}

export interface ContentCreationResult {
    success: boolean;
    topicId?: string | number;
    topicName?: string;
    error?: string;
}

export type YoutubeResourceMetadata = {
    url: string;
    videoInfo: VideoInfo | null;
    content: string | null;
    lengthContent: number;
    wordCount: number;
};

export type WebsiteResourceMetadata = {
    url: string;
    content: string;
};

export type TextResourceMetadata = {
    content: string;
};

export type MediaResourceMetadata = UploadFileResponse & { content: ITranscriptSegment[] };

export interface ISegmentTranscript {
    text: string;
    startTime: number;
    duration: number;
}

export interface IYoutubeCaptionSegment {
    text: string;
    startSecond: number;
    startMs: number;
    endSecond?: number;
    endMs?: number;
    duration?: number;
}

export type YoutubeResourcePayload = {
    url: string;
    videoInfo: VideoInfo | null;
    segments: IYoutubeCaptionSegment[];
    content: string | null;
    lengthContent: number;
    wordCount: number;
};

export interface IYoutubeResponse {
    segments: IYoutubeCaptionSegment[];
    transcript: string;
    metadata: VideoInfo;
}

export type WebsiteResourcePayload = {
    url: string;
    content: string;
};

export type TextResourcePayload = {
    content: string;
};

export type ResourceMetadataMap = {
    [RESOURCE_CONTENT_TYPE.FILE]: UploadFileResponse;
    [RESOURCE_CONTENT_TYPE.YOUTUBE]: YoutubeResourceMetadata;
    [RESOURCE_CONTENT_TYPE.WEBSITE]: WebsiteResourceMetadata;
    [RESOURCE_CONTENT_TYPE.TEXT]: TextResourceMetadata;
    [RESOURCE_CONTENT_TYPE.MEDIA]: MediaResourceMetadata;
};

export type IPayloadMetaDataResource =
    | UploadFileResponse
    | YoutubeResourceMetadata
    | WebsiteResourceMetadata
    | TextResourceMetadata;

export type InsertContentTopicParams =
    | {
          topicId: string | number;
          contentType: typeof RESOURCE_CONTENT_TYPE.FILE;
          payload: UploadFileResponse;
      }
    | {
          topicId: string | number;
          contentType: typeof RESOURCE_CONTENT_TYPE.YOUTUBE;
          payload: YoutubeResourceMetadata;
      }
    | {
          topicId: string | number;
          contentType: typeof RESOURCE_CONTENT_TYPE.WEBSITE;
          payload: WebsiteResourceMetadata;
      }
    | {
          topicId: string | number;
          contentType: typeof RESOURCE_CONTENT_TYPE.TEXT;
          payload: TextResourceMetadata;
      }
    | {
          topicId: string | number;
          contentType: null;
          payload: undefined;
      }
    | {
          topicId: string | number;
          contentType: typeof RESOURCE_CONTENT_TYPE.MEDIA;
          payload: MediaResourceMetadata;
      };

export type NonNullableInsertParams = Exclude<InsertContentTopicParams, { contentType: null }>;
