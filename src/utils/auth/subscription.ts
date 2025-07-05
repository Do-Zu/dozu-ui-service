import { ICurrentPlan } from '@/contexts/auth/AuthContext';
import { getSessionData } from '../storage';

export const getCurrentPlanUser = () => {
    return getSessionData<ICurrentPlan>('currentPlanUser');
};
