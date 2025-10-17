import { deleteRequest, getRequest, postRequest, putRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import {
    ICreateTopicForClassBody as ICreateTopicForClassBody,
    ICreateTopicBody,
    ICreateTopicResponse,
    IUpdateTopicBody,
    IUpdateTopicResponse,
    ITopic,
} from '@/app/[locale]/topics/types/topic.type';
import { HttpStatusCode } from 'axios';

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

    public async createTopic(topic: ICreateTopicPayload) {
        const { name, description, inputSetId, imageFile } = topic;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        if (inputSetId) {
            formData.append('inputSetId', inputSetId.toString());
        }
        if (imageFile) {
            formData.append('file', imageFile);
        }
        const response = await postRequest<FormData, ICreateTopicResponse>('/topics', formData);
        if (response.code === HttpStatusCode.PayloadTooLarge) {
            throw new Error('The size of your image is too large, please try with another image.');
        }
        if (response.status !== 'created') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async updateTopic(topic: IUpdateTopicPayload) {
        const { topicId, name, description, imageFile } = topic;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        if (imageFile) {
            formData.append('file', imageFile);
        }

        const response = await putRequest<FormData, IUpdateTopicResponse>(`/topics/${topicId}`, formData);
        if (response.code === HttpStatusCode.PayloadTooLarge) {
            throw new Error('The size of your image is too large, please try with another image.');
        }
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async deleteTopic(topicId: number): Promise<number> {
        const response = await deleteRequest<void, ApiResponse<number>>(`/topics/${topicId}`);
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
