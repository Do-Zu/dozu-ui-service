import { deleteRequest, postRequest, putRequest } from "@/api/api";
import { ICreateTopicInClassRequest, ICreateTopicInClassResponse, ICreateTopicRequest, ICreateTopicResponse, IUpdateTopicRequest, IUpdateTopicResponse } from "@/app/[locale]/topics/topic.type";

class TopicService {
    public async createTopic({ name, description } : ICreateTopicRequest) {
        const data = await postRequest<unknown, ICreateTopicResponse>('/topics', { name, description });
        return data;
    }

    public async updateTopic({ topicId, name, description } : IUpdateTopicRequest) {
        const data = await putRequest<unknown, IUpdateTopicResponse>(`/topics/${topicId}`, { name, description  });
        return data;
    }

    public async deleteTopic(topicId: number) : Promise<void> {
        await deleteRequest(`/topics/${topicId}`);
    }

    public async createTopicInClass({ classId, name, description } : ICreateTopicInClassRequest) {
        const data = await postRequest<unknown, ICreateTopicInClassResponse>(`/classes/${classId}/topic`, { name, description });
        return data;
    }

    public async updateTopicInClass({ topicId, name, description } : IUpdateTopicRequest) {
        const data = await putRequest<unknown, IUpdateTopicResponse>(`/topics/${topicId}`, { name, description });
        return data;
    }

    public async deleteTopicInClass(topicId: number) : Promise<void> {
        await deleteRequest(`/topics/${topicId}`);
    }
}

export default new TopicService();

