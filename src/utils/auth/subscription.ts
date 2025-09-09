import { ICurrentPlan } from '@/services/features/feature.type';
import { getSessionData } from '../storage';

export const getCurrentPlanUser = () => {
    return getSessionData<ICurrentPlan>('currentPlanUser');
};

export const normalizeUrl = (url: string) => {
    // Remove leading and trailing slashes
    url = url.replace(/^\/+|\/+$/g, '');
    // Add a leading slash if it doesn't exist
    return `/${url}`;
};
