import { UploadFileResponse } from '@/components/generative/types';

import { RESOURCE_CONTENT_TYPE } from '../constants/resource';

interface IEmbedVideoInfo {
    iframe_url: string;
    flash_url: string;
    flash_secure_url: string;
    width: number;
    height: number;
}
export interface VideoInfo {
    title: string;
    thumbnailUrl: string;
    videoId: string;
    duration: number;
    embed: IEmbedVideoInfo;
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

export type YoutubeResourcePayload = {
    url: string;
    videoInfo: VideoInfo | null;
    content: string | null;
    lengthContent: number;
    wordCount: number;
};

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
};

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
      };

export type NonNullableInsertParams = Exclude<InsertContentTopicParams, { contentType: null }>;
