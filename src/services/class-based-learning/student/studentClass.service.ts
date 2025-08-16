import { deleteRequest, getRequest, postRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { IClass, IJoinClassBody } from '@/app/[locale]/class-based/types/class.type';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';

class StudentClassService {
    public async getClasses() {
        const response = await getRequest<null, IClass[]>(`/classes/student`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getClassById(classId: number) {
        const response = await getRequest<null, IClass[]>(`/classes/student/${classId}`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getTopicsInClass(classId: number) {
        const response = await getRequest<null, ITopic>(`/classes/student/${classId}/topics`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async joinClass(code: string) {
        const response = await postRequest<IJoinClassBody, IClass>(`/enrollments`, { invitationCode: code });
        if (response.status !== 'created') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async leaveClass(classId: number) {
        const response = await deleteRequest<void, ApiResponse<number>>(`/enrollments/${classId}`);
        if(response.status != 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new StudentClassService();
