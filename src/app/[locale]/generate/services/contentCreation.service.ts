import Axios from '@/api/axios';
import { postRequest } from '@/api/api';
import { IFlashcardWithServer, handleConvertToFlashcardsSubmitted } from '../../flashcards/components/FlashcardEditor';
import { handleConvertToQuestionsSubmitted } from '../../question/utils/handleConvertToQuestionsSubmitted';
import { ContentType } from '../components/ContentGenerationPreview';
import topicService, { ICreateTopicForClassPayload, ICreateTopicPayload } from '@/services/topic/topic.service';
import { IQuestion } from '@/app/[locale]/question/types/question.type';
import flashcardService from '@/services/flashcard/flashcard.service';
import teacherTopicService from '@/services/class-based-learning/teacher/teacherTopic.service';
import { RESOURCE_CONTENT_TYPE, ResourceContentType } from '../constants/resource';
import { VideoInfo } from '../stores/features/contentExtractionSlice';
import { UploadFileResponse } from '@/components/generative/types';
import { toNumber } from '@/utils';

export interface CreateContentParams {
    topic: ICreateTopicPayload;
    contentType: ContentType | null;
    contentData: any;
}

export interface CreateContentForClassParams {
    topic: ICreateTopicForClassPayload;
    contentType: ContentType | null;
    contentData: any;
}

export interface ContentCreationResult {
    success: boolean;
    topicId?: string | number;
    topicName?: string;
    error?: string;
}

const INPUT_SET_RESOURCES_ENDPOINT = '/input-set/resources';

type YoutubeResourceMetadata = {
    url: string;
    videoInfo: VideoInfo | null;
    content: string | null;
    lengthContent: number;
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
          payload: Partial<YoutubeResourceMetadata>;
      }
    | {
          topicId: string | number;
          contentType: typeof RESOURCE_CONTENT_TYPE.WEBSITE;
          payload: Partial<WebsiteResourceMetadata>;
      }
    | {
          topicId: string | number;
          contentType: typeof RESOURCE_CONTENT_TYPE.TEXT;
          payload: Partial<TextResourceMetadata>;
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
export class ContentCreationService {
    /**
     * Creates a topic and saves the generated content
     */
    static async createContent(params: CreateContentParams): Promise<ContentCreationResult> {
        const { topic, contentType, contentData } = params;
        const { name, description, imageFile } = topic;

        try {
            // Phase 1: Create topic
            const data = await topicService.createTopic({
                name,
                description,
                imageFile,
            });

            const topic = data;

            if (!topic) {
                return { success: false, error: 'Failed to create topic' };
            }

            const { topicId } = topic;

            // Phase 2: Save content based on type
            switch (contentType) {
                case 'flashcard':
                    await this.saveFlashcards(topicId, contentData);
                    break;
                case 'quiz':
                    await this.saveQuiz(topicId, contentData as IQuestion[]);
                    break;
                case 'mindmap':
                    await this.saveMindmap(topicId, contentData);
                    break;
                default:
                    return { success: false, error: `Unsupported content type: ${contentType}` };
            }

            return { success: true, topicId };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    static async createContentForClass(params: CreateContentForClassParams): Promise<ContentCreationResult> {
        const { topic, contentType, contentData } = params;
        const { classId, name, description, imageFile } = topic;

        try {
            // Phase 1: Create topic in a specific class
            const data = await teacherTopicService.createTopicForClass({
                classId,
                name,
                description,
                imageFile,
            });

            const topic = data;

            if (!topic) {
                return { success: false, error: 'Failed to create topic' };
            }

            const { topicId } = topic;

            // Phase 2: Save content based on type
            switch (contentType) {
                case 'flashcard':
                    await this.saveFlashcards(topicId, contentData);
                    break;
                case 'quiz':
                    await this.saveQuiz(topicId, contentData as IQuestion[]);
                    break;
                case 'mindmap':
                    await this.saveMindmap(topicId, contentData);
                    break;
                default:
                    return { success: false, error: `Unsupported content type: ${contentType}` };
            }

            return { success: true, topicId, topicName: topic.name };
        } catch (error) {
            console.error('Content creation failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Insert the original imported resource into the topic, based on how the user imported it.
     * - file: attach by from upload flow
     * - url (youtube): attach url + video metadata + transcript/segments
     * - url (website): attach url + extracted content
     * - text: attach raw text
     */
    public static async insertContentTopic(params: InsertContentTopicParams): Promise<void> {
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

    private static hasValidContentType(params: InsertContentTopicParams): params is NonNullableInsertParams {
        return params.contentType !== null;
    }

    private static resolveResourceMetadata(
        params: NonNullableInsertParams,
    ): ResourceMetadataMap[ResourceContentType] | null {
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

                return {
                    url,
                    videoInfo: params.payload?.videoInfo ?? null,
                    content: params.payload?.content ?? null,
                    lengthContent: toNumber(params.payload?.content?.length, 0),
                };
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

    /**
     * Saves flashcards to a topic
     */
    private static async saveFlashcards(topicId: string | number, flashcards: IFlashcardWithServer[]): Promise<void> {
        if (!flashcards) {
            throw new Error('No flashcards provided');
        }

        const flashcardsSubmitted = handleConvertToFlashcardsSubmitted(flashcards);

        if (!flashcardsSubmitted) {
            throw new Error('No valid flashcards to submit');
        }

        // await postRequest(`/flashcards/batch?topicId=${topicId}`, flashcardsSubmitted);
        await flashcardService.batchFlashcardsForTopic({ topicId, flashcards: flashcardsSubmitted }); // CHANGE FOR USING FLASHCARD SERVICE
    }

    /**
     * Saves quiz to a topic
     * TODO: Implement quiz saving logic
     */
    private static async saveQuiz(topicId: string | number, quizData: IQuestion[]): Promise<void> {
        if (!quizData || quizData.length === 0) {
            throw new Error('No quiz data provided');
        }

        const questionsSubmitted = handleConvertToQuestionsSubmitted(quizData);

        if (!questionsSubmitted) {
            throw new Error('No valid quiz questions to submit');
        }

        await postRequest(`/questions/batch?topicId=${topicId}`, questionsSubmitted);
    }

    /**
     * Saves mindmap to a topic
     * TODO: Implement mindmap saving logic
     */
    private static async saveMindmap(topicId: string | number, mindmapData: any): Promise<void> {
        // TODO: Implement mindmap API endpoint
        if (!mindmapData) {
            throw new Error('No mindmap data provided');
        }
        const options: any = {
            body: {
                title: 'a', //temp value
                nodes: mindmapData.nodes,
                edges: mindmapData.edges,
            },
        };
        const response = await Axios.post(`/mindmap/${topicId}`, options.body);
    }
}
