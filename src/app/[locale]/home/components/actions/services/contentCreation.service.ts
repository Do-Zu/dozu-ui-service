import axios from 'axios';
import { postRequest } from '@/api/api';
import {
    InsertContentTopicParams,
    IPayloadMetaDataResource,
    IYoutubeCaptionSegment,
    NonNullableInsertParams,
    ResourceMetadataMap,
    YoutubeResourcePayload,
} from '../types/resource.type';
import { ResourceContentType, RESOURCE_CONTENT_TYPE } from '../constants/resource';
import { extractYouTubeVideoId } from '../helper/helper';
import { countWords, isNilOrEmpty, safeDestructure } from '@/utils';
import topicService from '@/services/topic/topic.service';

/**
 * Service class to handle content creation operations
 */
class ContentCreationService {
    private readonly INPUT_SET_RESOURCES_ENDPOINT = '/input-set/resources';
    private readonly BASE_API_YOUTUBE = '/api/youtube/transcript?videoId=';
    private readonly BASE_API_EXTRACT_WEBSITE = '/api/website-content';

    public handleGetInfoVideo = async ({ pastedUrl }: { pastedUrl: string }): Promise<YoutubeResourcePayload> => {
        const videoId = extractYouTubeVideoId(pastedUrl?.trim());

        const { data } = await axios.get(`${this.BASE_API_YOUTUBE}${videoId}`);

        const { transcript, metadata, transcriptSegments } = safeDestructure(data, {
            transcript: '',
            transcriptSegments: [],
            metadata: {},
        });

        const segments = transcriptSegments.filter((segment: IYoutubeCaptionSegment) => !isNilOrEmpty(segment.text));

        const youtubePayload: YoutubeResourcePayload = {
            url: pastedUrl,
            videoInfo: {
                ...metadata,
                videoId,
            },
            lengthContent: transcript.length,
            segments,
            content: transcript,
            wordCount: countWords(transcript),
        };

        return youtubePayload;
    };

    public createTopicContent = async ({
        name,
        description = '',
        contentType,
        payloadMetaData,
    }: {
        name: string;
        description: string;
        contentType: ResourceContentType;
        payloadMetaData: IPayloadMetaDataResource;
    }) => {
        try {
            const { topicId } = await topicService.createTopic({
                name,
                description,
            });

            const payload = {
                topicId,
                contentType,
                payload: payloadMetaData,
            } as InsertContentTopicParams;

            await this.insertContentTopic(payload);

            return { topicId };
        } catch (error) {
            throw error;
        }
    };

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
            await postRequest(this.INPUT_SET_RESOURCES_ENDPOINT, {
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
