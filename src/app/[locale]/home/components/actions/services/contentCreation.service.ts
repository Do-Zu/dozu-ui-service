import { postRequest } from '@/api/api';
import { UploadFileResponse } from '@/components/generative/types';
import { RESOURCE_CONTENT_TYPE, ResourceContentType } from '../constants/resource';

export interface ContentCreationResult {
    success: boolean;
    topicId?: string | number;
    topicName?: string;
    error?: string;
}

const INPUT_SET_RESOURCES_ENDPOINT = '/input-set/resources';

type YoutubeResourceMetadata = {
    url: string;
    // videoInfo: VideoInfo | null;
    content: string | null;
    lengthContent: number;
    wordCount: number;
};

type WebsiteResourceMetadata = {
    url: string;
    content: string;
};

type TextResourceMetadata = {
    content: string;
};

type ResourceMetadataMap = {
    [RESOURCE_CONTENT_TYPE.FILE]: UploadFileResponse;
    [RESOURCE_CONTENT_TYPE.YOUTUBE]: YoutubeResourceMetadata;
    [RESOURCE_CONTENT_TYPE.WEBSITE]: WebsiteResourceMetadata;
    [RESOURCE_CONTENT_TYPE.TEXT]: TextResourceMetadata;
};

type InsertContentTopicParams =
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

type NonNullableInsertParams = Exclude<InsertContentTopicParams, { contentType: null }>;

/**
 * Service class to handle content creation operations
 */
class ContentCreationService {
    /**
     * Insert the original imported resource into the topic, based on how the user imported it.
     * - file: attach by from upload flow
     * - url (youtube): attach url + video metadata + transcript
     * - url (website): attach url + extracted content
     * - text: attach raw text
     */
    public async insertContentTopic(params: InsertContentTopicParams): Promise<void> {
        if (!this.hasValidContentType(params)) {
            return;
        }

        try {
            const metadata = this.resolveResourceMetadata(params);

            if (!metadata) {
                return;
            }

            //Insert input set content
            await postRequest(INPUT_SET_RESOURCES_ENDPOINT, {
                topicId: params.topicId,
                contentType: params.contentType,
                metadata,
            });
        } catch (error) {
            throw error;
        }
    }

    private hasValidContentType(params: InsertContentTopicParams): params is NonNullableInsertParams {
        return params.contentType !== null;
    }

    private resolveResourceMetadata(params: NonNullableInsertParams): ResourceMetadataMap[ResourceContentType] | null {
        switch (params.contentType) {
            case RESOURCE_CONTENT_TYPE.FILE: {
                return {
                    ...params.payload,
                };
            }
            case RESOURCE_CONTENT_TYPE.YOUTUBE: {
                const url = params.payload?.url;

                if (!url) {
                    return null;
                }

                return { ...params.payload };
            }
            case RESOURCE_CONTENT_TYPE.WEBSITE: {
                const url = params.payload?.url;
                const content = params.payload?.content;

                if (!url || !content) {
                    return null;
                }

                return { url, content };
            }
            case RESOURCE_CONTENT_TYPE.TEXT: {
                const content = params.payload?.content;

                if (!content) {
                    return null;
                }

                return { content };
            }
            default:
                return null;
        }
    }
}

export const resourceService = new ContentCreationService();
