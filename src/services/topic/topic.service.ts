import { deleteRequest, getRequest, postRequest, putRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import {
    ICreateTopicForClassBody as ICreateTopicForClassBody,
    ICreateTopicForClassResponse,
    ICreateTopicBody,
    ICreateTopicResponse,
    IUpdateTopicBody,
    IUpdateTopicResponse,
    ITopic,
} from '@/app/[locale]/topics/types/topic.type';

export type ICreateTopicPayload = ICreateTopicBody;
export type IUpdateTopicPayload = IUpdateTopicBody & { topicId: number };
export type ICreateTopicForClassPayload = ICreateTopicForClassBody & { classId: number };
export type IUpdateTopicInClassPayload = IUpdateTopicBody & { classId: number; topicId: number };
export type IDeleteTopicInClassPayload = Pick<ITopic, 'classId' | 'topicId'>;

class TopicService {
    public async getTopicById(topicId: number) {
        const response = await getRequest<null, ITopic>(`/topics/${topicId}`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getTopics() {
        const response = await getRequest<null, ITopic[]>('/topics');
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async createTopic({ name, description, inputSetId }: ICreateTopicPayload) {
        const response = await postRequest<ICreateTopicBody, ICreateTopicResponse>('/topics', {
            name,
            description,
            inputSetId,
        });
        if (response.status !== 'created') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async updateTopic({ topicId, name, description }: IUpdateTopicPayload) {
        const response = await putRequest<IUpdateTopicBody, IUpdateTopicResponse>(`/topics/${topicId}`, {
            name,
            description,
        });
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async deleteTopic(topicId: number): Promise<number> {
        const response = await deleteRequest<null, ApiResponse<number>>(`/topics/${topicId}`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    // not yet available to use
    // start learning flashcards of a specific topic, purpose: init default sm-2 tracking records
    public async startLearningFlashcards(topicId: number): Promise<ApiResponse<{}>> {
        const data = await postRequest<{}, {}>(`/topics/${topicId}/flashcards/start-learning`, {});
        return data;
    }
}

export default new TopicService();
