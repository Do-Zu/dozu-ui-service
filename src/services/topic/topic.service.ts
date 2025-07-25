import { deleteRequest, postRequest, putRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import {
    ICreateTopicForClassBody as ICreateTopicForClassBody,
    ICreateTopicForClassResponse,
    ICreateTopicBody,
    ICreateTopicResponse,
    IUpdateTopicBody,
    IUpdateTopicResponse,
} from '@/app/[locale]/topics/types/topic.type';

export type ICreateTopicPayload = ICreateTopicBody;
export type IUpdateTopicPayload = IUpdateTopicBody & { topicId: number };
export type ICreateTopicForClassPayload = ICreateTopicForClassBody & { classId: number };

class TopicService {
    public async createTopic({ name, description, inputSetId }: ICreateTopicBody) {
        const data = await postRequest<ICreateTopicBody, ICreateTopicResponse>('/topics', {
            name,
            description,
            inputSetId,
        });
        return data;
    }

    public async updateTopic({ topicId, name, description }: IUpdateTopicPayload) {
        const data = await putRequest<IUpdateTopicBody, IUpdateTopicResponse>(`/topics/${topicId}`, {
            name,
            description,
        });
        return data;
    }

    public async deleteTopic(topicId: number): Promise<void> {
        await deleteRequest(`/topics/${topicId}`);
    }

    public async createTopicForClass({ classId, name, description, inputSetId }: ICreateTopicForClassPayload) {
        const data = await postRequest<ICreateTopicBody, ICreateTopicForClassResponse>(`/classes/${classId}/topic`, {
            name,
            description,
            inputSetId,
        });
        return data;
    }

    public async updateTopicInClass({ topicId, name, description }: IUpdateTopicPayload) {
        const data = await putRequest<IUpdateTopicBody, IUpdateTopicResponse>(`/topics/${topicId}`, {
            name,
            description,
        });
        return data;
    }

    public async deleteTopicInClass(topicId: number): Promise<void> {
        await deleteRequest(`/topics/${topicId}`);
    }

    // start learning flashcards of a specific topic, purpose: init default sm-2 tracking records
    public async startLearningFlashcards(topicId: number): Promise<ApiResponse<{}>> {
        const data = await postRequest<{}, {}>(`/topics/${topicId}/flashcards/start-learning`, {});
        return data;
    }
}

export default new TopicService();
