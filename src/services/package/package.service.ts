import { getRequest, postRequest, deleteRequest, putRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import {
    CreatePackageRequest,
    DeletePackageRequest,
    GetPackagesQuery,
    PackageItem,
    TopicItem,
    UpdateTopicInPackageRequest,
    PackageId,
    GetTopicBelongPackageRequest,
} from './package.type';

const BASE = '/package';

export const packageService = {
    async getPackages(params?: GetPackagesQuery): Promise<ApiResponse<PackageItem[]>> {
        const query = new URLSearchParams();
        if (params?.limit != null) query.set('limit', String(params.limit));
        if (params?.offset != null) query.set('offset', String(params.offset));
        const url = query.toString() ? `${BASE}?${query.toString()}` : BASE;
        return getRequest<unknown, PackageItem[]>(url);
    },

    async createNewPackage(payload: CreatePackageRequest): Promise<ApiResponse<unknown>> {
        return postRequest<CreatePackageRequest, unknown>(`${BASE}/new`, payload);
    },

    async deletePackage(payload: DeletePackageRequest): Promise<ApiResponse<unknown>> {
        return deleteRequest<DeletePackageRequest, ApiResponse<unknown>>(BASE, payload);
    },

    async getTopicsByPackage(packageId: PackageId): Promise<ApiResponse<TopicItem[]>> {
        const url = `${BASE}/topic-package`;
        return postRequest<GetTopicBelongPackageRequest, TopicItem[]>(url, {
            packageId,
        });
    },

    async moveTopicToPackage(payload: UpdateTopicInPackageRequest): Promise<ApiResponse<unknown>> {
        return putRequest<UpdateTopicInPackageRequest, unknown>(`${BASE}/topic/modify`, payload);
    },
};

export type PackageService = typeof packageService;
