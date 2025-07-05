import { ICurrentPlan } from '@/contexts/auth/AuthContext';
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
