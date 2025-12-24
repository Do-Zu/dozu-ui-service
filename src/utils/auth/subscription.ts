import { getSessionData } from '../storage';
import { ICurrentPlan } from '@/services/features/feature.type';
import { SESSION_STORAGE_KEY } from '../constants/storage';

export const getCurrentPlanUser = () => {
    return getSessionData<ICurrentPlan>(SESSION_STORAGE_KEY.CURRENT_USER_PLAN);
};

export const normalizeUrl = (url: string) => {
    // Remove leading and trailing slashes
    url = url.replace(/^\/+|\/+$/g, '');
    // Add a leading slash if it doesn't exist
    return `/${url}`;
};
