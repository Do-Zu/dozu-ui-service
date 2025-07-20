import { postRequest } from '@/api/api';
import { IFlashcardWithServer, handleConvertToFlashcardsSubmitted } from '../../flashcards/components/FlashcardEditor';
import { handleConvertToQuestionsSubmitted } from '../../question/utils/handleConvertToQuestionsSubmitted';
import { ContentType } from '../components/ContentGenerationPreview';
import Axios from '@/api/axios';
import topicService from '@/services/topic/topic.service';
import { store } from '@/stores/store';
import { IQuestion } from '@/app/[locale]/question/types/question.type';

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
            const data = await topicService.createTopic({ name: topicName, description: topicDescription, inputSetId: state.inputSet.inputSetId });
            const topic = data.data; 

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
    private static async saveQuiz(topicId: string | number, quizData: IQuestion[]): Promise<void> {
        if (!quizData || quizData.length === 0) {
            throw new Error('No quiz data provided');
        }

        console.log({quizData})

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
