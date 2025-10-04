import { getRequest, postRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import {
    ISchedulePreference,
    IUpdateSchedulePreferencePayload,
    IGetSchedulePreferenceResponse,
} from './schedule.types';

class ScheduleService {
    /**
     * Get user's schedule preferences
     * @returns Promise<ISchedulePreference>
     */
    public async getPreferences(): Promise<ISchedulePreference> {
        const response = await getRequest<any, IGetSchedulePreferenceResponse>('/schedule/preference');
        return response.data;
    }

    /**
     * Update user's schedule preferences
     * @param payload - The preference data to update
     * @returns Promise<ISchedulePreference>
     */
    public async updatePreferences(payload: IUpdateSchedulePreferencePayload): Promise<ISchedulePreference> {
        const response = await postRequest<IUpdateSchedulePreferencePayload, ISchedulePreference>(
            '/schedule/preference',
            payload,
        );
        return response.data;
    }
}

const scheduleService = new ScheduleService();
export default scheduleService;
