import { deleteRequest, postRequest, putRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import {
    ICreateTopicForClassResponse,
    IUpdateTopicResponse,
} from '@/app/[locale]/topics/types/topic.type';
import {
    ICreateTopicForClassPayload,
    IDeleteTopicInClassPayload,
    IUpdateTopicInClassPayload,
} from '@/services/topic/topic.service';

class TeacherClassTopicService {
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
        const response = await postRequest<FormData, ICreateTopicForClassResponse>(
            `/classes/teacher/${classId}/topics`,
            formData,
        );
        if (response.status !== 'created') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async updateTopicInClass(topic: IUpdateTopicInClassPayload) {
        const { classId, topicId, name, description, imageFile } = topic;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        if (imageFile) {
            formData.append('file', imageFile);
        }
        const response = await putRequest<FormData, IUpdateTopicResponse>(
            `/classes/teacher/${classId}/topics/${topicId}`,
            formData,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
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

export default new TeacherClassTopicService();
