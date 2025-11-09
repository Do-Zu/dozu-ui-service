import { ComponentType } from 'react';
import { TypeMethodLearning } from '@/utils/constants/method';

export type TopicWorkspaceTabValue = 'overview' | TypeMethodLearning;

export interface TabConfig {
    value: TopicWorkspaceTabValue;
    label: string;
    component: ComponentType;
}
