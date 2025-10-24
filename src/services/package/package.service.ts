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
    UpdateTopicInPackageResponse,
    UpdatePackageRequest,
    IUpdatePackageResponse,
    CreatePackageResponse,
    GetTopicUnAssignedPackagesRequest,
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

    async createNewPackage(payload: CreatePackageRequest): Promise<ApiResponse<CreatePackageResponse>> {
        return postRequest<CreatePackageRequest, CreatePackageResponse>(`${BASE}/new`, payload);
    },

    async updatePackage(payload: UpdatePackageRequest): Promise<ApiResponse<IUpdatePackageResponse>> {
        return putRequest<UpdatePackageRequest, IUpdatePackageResponse>(`${BASE}`, payload);
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

    async getTopicUnAssignedForPackage(payload: GetTopicUnAssignedPackagesRequest): Promise<ApiResponse<TopicItem[]>> {
        const url = `${BASE}/topics/unassigned`;
        return postRequest<GetTopicBelongPackageRequest, TopicItem[]>(url, payload);
    },

    async moveTopicToPackage(payload: UpdateTopicInPackageRequest): Promise<ApiResponse<UpdateTopicInPackageResponse>> {
        return putRequest<UpdateTopicInPackageRequest, UpdateTopicInPackageResponse>(`${BASE}/topic/modify`, payload);
    },

    async removeTopicInPackage(payload: UpdateTopicInPackageRequest) {
        return putRequest<UpdateTopicInPackageRequest, unknown>(`${BASE}/topic/remove`, payload);
    },
};

export type PackageService = typeof packageService;
