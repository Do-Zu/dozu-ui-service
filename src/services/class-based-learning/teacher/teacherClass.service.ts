import { deleteRequest, getRequest, postRequest, putRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import {
    IClass,
    ICreateClassBody,
    ICreateClassResponse,
    IStudentInClass,
    IUpdateClassBody,
    IUpdateClassResponse,
} from '@/app/[locale]/class-based/types/class.type';
import { IUserProfile } from '@/types/profile';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import { HttpStatusCode, isAxiosError } from 'axios';

export type ICreateClassPayload = ICreateClassBody;
export type IUpdateClassPayload = IUpdateClassBody & { classId: number };
export type IRemoveStudentInClassPayload = { classId: number; studentId: number };

class TeacherClassService {
    public async getClasses() {
        const response = await getRequest<void, IClass[]>(`/classes/teacher`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getClassById(classId: number) {
        const response = await getRequest<void, IClass[]>(`/classes/teacher/${classId}`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async createClass(data: ICreateClassPayload) {
        const { name, description, imageFile } = data;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        if (imageFile) {
            formData.append('file', imageFile);
        }
        try {
            const response = await postRequest<FormData, ICreateClassResponse>('/classes/teacher', formData);
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

    public async updateClass(data: IUpdateClassPayload) {
        const { classId, name, description, imageFile } = data;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        if (imageFile) {
            formData.append('file', imageFile);
        }
        try {
            const response = await putRequest<FormData, IUpdateClassResponse>(`/classes/teacher/${classId}`, formData);
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

    public async getStudentsInClass(classId: number) {
        const response = await getRequest<void, IStudentInClass[]>(`/enrollments/${classId}/students`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async removeStudentFromClass({ classId, studentId }: IRemoveStudentInClassPayload) {
        const response = await deleteRequest<void, ApiResponse<number>>(
            `/enrollments/${classId}/students/${studentId}`,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getStudentProfile(userId: number) {
        const response = await getRequest<void, IUserProfile>(`/profile/${userId}`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new TeacherClassService();
