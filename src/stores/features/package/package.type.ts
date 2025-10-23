import { PackageId, PackageItem, TopicItem } from '@/services/package/package.type';

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
    topicsByPackage: Record<string, IStatePackage>;
    expendPackage: Record<PackageId, boolean>;
}
