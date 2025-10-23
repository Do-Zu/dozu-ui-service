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
    topicId: number | string;
    packageId: PackageId;
}

export interface UpdateTopicInPackagePayload {
    topic: ITopic;
    packageId: PackageId;
}

/* Queries */
export interface GetPackagesQuery {
    limit?: number;
    offset?: number;
}
