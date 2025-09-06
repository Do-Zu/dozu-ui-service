import { deleteRequest, getRequest, postRequest, putRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';

export type ICreateClassFeedBody = Pick<IClassFeed, 'title' | 'content' | 'link'>;
export type ICreateClassFeedPayload = ICreateClassFeedBody & { classId: number };

export type IUpdateClassFeedBody = Pick<IClassFeed, 'title' | 'content' | 'link'>;
export type IUpdateClassFeedPayload = IUpdateClassFeedBody & { classId: number; classFeedId: number };

export type IDeleteClassFeedPayload = { classId: number; classFeedId: number };

class ClassFeedService {
    public async createGeneralFeed(payload: ICreateClassFeedPayload) {
        const { classId, title, content, link } = payload;
        const response = await postRequest<ICreateClassFeedBody, IClassFeed>(`/classes/teacher/${classId}/feeds`, {
            title,
            content,
            link,
        });
        if (response.status !== 'created') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getFeedsInClass({ classId }: { classId: string | number }) {
        const response = await getRequest<void, IClassFeed[]>(`/classes/student/${classId}/feeds`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getFeedsInClassForTeacher({ classId }: { classId: string | number }) {
        const response = await getRequest<void, IClassFeed[]>(`/classes/teacher/${classId}/feeds`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async updateFeed(payload: IUpdateClassFeedPayload) {
        const { classId, classFeedId, title, content } = payload;
        const response = await putRequest<IUpdateClassFeedBody, IClassFeed>(
            `/classes/teacher/${classId}/feeds/${classFeedId}`,
            { title, content },
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async deleteFeed(payload: IDeleteClassFeedPayload) {
        const { classId, classFeedId } = payload;
        const response = await deleteRequest<void, ApiResponse<number>>(
            `/classes/teacher/${classId}/feeds/${classFeedId}`,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new ClassFeedService();
