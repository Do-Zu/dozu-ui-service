import { PackageId, PackageItem, TopicId, TopicItem } from '@/services/package/package.type';

export interface IStatePackage {
    isFetchingTopic: boolean;
    error: string | null;
    topics: TopicItem[];
}

export interface PackageState {
    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;
    packages: PackageItem[];
    selectedTopicId: TopicId | null;
    topicsByPackage: Record<string, IStatePackage>;
    expendPackage: Record<PackageId, boolean>;
}
