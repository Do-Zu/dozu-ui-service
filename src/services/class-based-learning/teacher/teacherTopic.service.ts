import { deleteRequest, getRequest, postRequest, putRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { ICreateTopicForClassResponse, ITopic, IUpdateTopicResponse } from '@/app/[locale]/topics/types/topic.type';
import {
    ICreateTopicForClassPayload,
    IDeleteTopicInClassPayload,
    IUpdateTopicInClassPayload,
} from '@/services/topic/topic.service';
import { HttpStatusCode, isAxiosError } from 'axios';

class TeacherTopicService {
    public async getTopicsInClass(classId: number) {
        const response = await getRequest<void, ITopic>(`/classes/teacher/${classId}/topics`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async createTopicForClass(topic: ICreateTopicForClassPayload) {
        const { classId, name, description, inputSetId, imageFile } = topic;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        if (inputSetId) {
            formData.append('inputSetId', inputSetId.toString());
        }
        if (imageFile) {
            formData.append('file', imageFile);
        }
        try {
            const response = await postRequest<FormData, ICreateTopicForClassResponse>(
                `/classes/teacher/${classId}/topics`,
                formData,
            );
            if (response.status !== 'created') {
                throw new Error(response.message);
            }
            return response.data;
        } catch (e) {
            if (isAxiosError(e) && e.response?.status === HttpStatusCode.PayloadTooLarge) {
                throw new Error('The size of your image is too large, please try with another image.');
            }
            throw e;
        }
    }

    public async updateTopicInClass(topic: IUpdateTopicInClassPayload) {
        const { classId, topicId, name, description, imageFile } = topic;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        if (imageFile) {
            formData.append('file', imageFile);
        }
        try {
            const response = await putRequest<FormData, IUpdateTopicResponse>(
                `/classes/teacher/${classId}/topics/${topicId}`,
                formData,
            );
            if (response.status !== 'success') {
                throw new Error(response.message);
            }
            return response.data;
        } catch (e) {
            if (isAxiosError(e) && e.response?.status === HttpStatusCode.PayloadTooLarge) {
                throw new Error('The size of your image is too large, please try with another image.');
            }
            throw e;
        }
    }

    public async deleteTopicInClass({ classId, topicId }: IDeleteTopicInClassPayload): Promise<number> {
        const response = await deleteRequest<void, ApiResponse<number>>(
            `/classes/teacher/${classId}/topics/${topicId}`,
        );
        if (response.status != 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new TeacherTopicService();
