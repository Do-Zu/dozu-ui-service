import { postRequest } from '@/api/api';
import { IFlashcardWithServer, handleConvertToFlashcardsSubmitted } from '../../flashcards/components/FlashcardEditor';
import { handleCreateTopic } from '../../topics/components/TopicCreatedForm';
import { ContentType } from '../components/ContentGenerationPreview';
import Axios from '@/api/axios';
import { store } from '@/stores/store';

export interface CreateContentParams {
    topicName: string;
    topicDescription: string;
    contentType: ContentType | null;
    contentData: any;
}

export interface ContentCreationResult {
    success: boolean;
    topicId?: string | number;
    error?: string;
}

/**
 * Service class to handle content creation operations
 */
export class ContentCreationService {
    /**
     * Creates a topic and saves the generated content
     */
    static async createContent(params: CreateContentParams): Promise<ContentCreationResult> {
        const { topicName, topicDescription, contentType, contentData } = params;

        const state = store.getState()//get state to get inputSetId saved on file upload - DuyND
        

        try {
            // Phase 1: Create topic
            const topic = await handleCreateTopic({
                name: topicName,
                description: topicDescription,
                inputSetId:state.inputSet.inputSetId
            });

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
                    await this.saveQuiz(topicId, contentData);
                    break;
                case 'mindmap':
                    await this.saveMindmap(topicId, contentData);
                    break;
                default:
                    return { success: false, error: `Unsupported content type: ${contentType}` };
            }

            return { success: true, topicId };
        } catch (error) {
            console.error('Content creation failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
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

        await postRequest(`/flashcards/batch?topicId=${topicId}`, flashcardsSubmitted);
    }

    /**
     * Saves quiz to a topic
     * TODO: Implement quiz saving logic
     */
    private static async saveQuiz(topicId: string | number, quizData: any): Promise<void> {
        // TODO: Implement quiz API endpoint
        console.log('Saving quiz for topic:', topicId, quizData);
        throw new Error('Quiz saving not implemented yet');
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
