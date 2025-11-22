import { ComponentType } from 'react';
import { TypeMethodLearning } from '@/utils/constants/method';

export type TopicWorkspaceTabValue = 'overview' | TypeMethodLearning | 'note';

export interface TabConfig {
    value: TopicWorkspaceTabValue;
    label: string;
    component: ComponentType;
    icon?: React.ReactNode;
}
