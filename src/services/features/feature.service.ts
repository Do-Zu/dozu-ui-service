import { getRequest, postRequest } from '@/api/api';
import { IFeatureResponse, ICurrentPlanSubscriptionResponse, IFeatureRequest } from './feature.type';

const getCurrentPlanSubscription = async () => {
    const result = await getRequest<ICurrentPlanSubscriptionResponse, ICurrentPlanSubscriptionResponse>(
        '/subscription/current-plan',
    );
    return result;
};

const getAllFeatureBelongPlan = async (planId: number) => {
    const result = await postRequest<IFeatureRequest, IFeatureResponse[]>(`/subscription/plan/features`, {
        planId,
    });
    return result;
};

export { getCurrentPlanSubscription, getAllFeatureBelongPlan };
