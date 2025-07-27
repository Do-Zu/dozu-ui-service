import { deleteRequest, getRequest, postRequest, putRequest } from '@/api/api';
import {
    IClass,
    ICreateClassBody,
    ICreateClassResponse,
    IJoinClassBody,
    IUpdateClassBody,
    IUpdateClassResponse,
} from '@/app/[locale]/class-based/types/class.type';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';

export type ICreateClassPayload = ICreateClassBody;
export type IUpdateClassPayload = IUpdateClassBody & { classId: number };

class ClassService {
    public async createClass({ name, description }: ICreateClassPayload) {
        const data = await postRequest<ICreateClassBody, ICreateClassResponse>('/classes', { name, description });
        return data;
    }

    public async updateClass({ classId, name, description }: IUpdateClassPayload) {
        const data = await putRequest<IUpdateClassBody, IUpdateClassResponse>(`/classes/${classId}`, {
            name,
            description,
        });
        return data;
    }

    public async getTopicsInClass(classId: number) {
        const data = await getRequest<unknown, ITopic>(`/classes/${classId}/topics`);
        return data;
    }

    public async joinClass(code: string) {
        const data = await postRequest<IJoinClassBody, IClass>(`/classes/enrollments`, { invitationCode: code });
        return data;
    }

    public async leaveClass(classId: number) {
        const data = await deleteRequest(`/classes/enrollments/${classId}`);
        return data;
    }

    public async removeStudentFromClass(classId: number, studentId: number) {
        const data = await deleteRequest(`/classes/enrollments/${classId}/students/${studentId}`);
        return data;
    }
}

export default new ClassService();
