import { getRequest, postRequest, putRequest } from '@/api/api';
import {
    IClass,
    ICreateClassRequest,
    ICreateClassResponse,
    IUpdateClassRequest,
    IUpdateClassResponse,
} from '@/app/[locale]/class-based-learning/types/class.type';
import { ITopic } from '@/app/[locale]/topics/topic.type';

class ClassManagementService {
    public async createClass({ name, description }: ICreateClassRequest) {
        const data = await postRequest<ICreateClassRequest, ICreateClassResponse>('/classes', { name, description });
        return data;
    }

    public async updateClass({ classId, name, description }: IUpdateClassRequest) {
        const data = await putRequest<unknown, IUpdateClassResponse>(
            `/classes/${classId}`,
            {
                name,
                description,
            },
        );
        return data;
    }

    public async getTopicsInClass(classId: number) {
        const data = await getRequest<unknown, ITopic>(`/classes/${classId}/topics`);
        return data;
    }

    public async joinClass(code: string) {
        const data = await postRequest<unknown, IClass>(`/classes/enrollments`, { invitationCode: code });
        return data;
    }
}

export default new ClassManagementService();
