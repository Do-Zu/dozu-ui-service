import { getRequest } from "@/api/api";
import { ITopic } from "@/app/[locale]/topics/types/topic.type";

class StudentTopicService {
    public async getTopicsInClass(classId: number) {
        const response = await getRequest<null, ITopic[]>(`/classes/student/${classId}/topics`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new StudentTopicService();