import { ITopic } from '@/app/[locale]/topics/types/topic.type';

export type PackageId = number | string;
export type TopicId = number | string;

export interface PackageItem {
    id: PackageId;
    title: string;
    parentId?: PackageId | null;
}

export interface TopicItem {
    topicId: TopicId;
    packageId: PackageId;
    name: string;
    description?: string | null;
    classId?: number | string | null;
}

/* Requests */
export interface CreatePackageRequest {
    title: string;
    parentId?: PackageId | null;
}
export interface GetTopicBelongPackageRequest {
    packageId: PackageId;
}

export interface DeletePackageRequest {
    packageId: PackageId;
}

export interface UpdateTopicInPackageRequest {
    topicId: TopicId;
    packageId: PackageId;
}

export interface UpdateTopicInPackagePayload {
    topic: Partial<ITopic>;
    packageId: PackageId;
}

export type UpdateTopicInPackageResponse = TopicItem;
export interface UpdatePackageRequest extends CreatePackageRequest {
    packageId: PackageId;
}

export interface GetPackagesQuery {
    limit?: number;
    offset?: number;
}

export interface GetTopicUnAssignedPackagesRequest {
    limit?: number;
    offset?: number;
    packageId: PackageId;
}

export interface CreatePackageResponse {
    packageId: number;
    title: string;
    parentId: number | null;
    createdAt: Date;
}
export interface IUpdatePackageResponse {
    id: number;
    title: string;
    parentId: number | null;
}
