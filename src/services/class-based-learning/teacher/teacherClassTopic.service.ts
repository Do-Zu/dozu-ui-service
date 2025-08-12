import { deleteRequest, postRequest, putRequest } from "@/api/api";
import { ApiResponse } from "@/api/type";
import { ICreateTopicBody, ICreateTopicForClassResponse, IUpdateTopicBody, IUpdateTopicResponse } from "@/app/[locale]/topics/types/topic.type";
import { ICreateTopicForClassPayload, IDeleteTopicInClassPayload, IUpdateTopicInClassPayload } from "@/services/topic/topic.service";

class TeacherClassTopicService {
    public async createTopicForClass({ classId, name, description, inputSetId }: ICreateTopicForClassPayload) {
        const response = await postRequest<ICreateTopicBody, ICreateTopicForClassResponse>(
            `/classes/teacher/${classId}/topics`,
            {
                name,
                description,
                inputSetId,
            },
        );
        if (response.status !== 'created') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async updateTopicInClass({ classId, topicId, name, description }: IUpdateTopicInClassPayload) {
        const response = await putRequest<IUpdateTopicBody, IUpdateTopicResponse>(
            `/classes/teacher/${classId}/topics/${topicId}`,
            {
                name,
                description,
            },
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response;
    }

    public async deleteTopicInClass({ classId, topicId }: IDeleteTopicInClassPayload): Promise<number> {
        const response = await deleteRequest<null, ApiResponse<number>>(
            `/classes/teacher/${classId}/topics/${topicId}`,
        );
        if (response.status != 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new TeacherClassTopicService();