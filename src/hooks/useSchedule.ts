import { z } from 'zod';
import useFetch from '@/hooks/useFetch';
import usePost from '@/hooks/usePost';
import { scheduleService } from '@/services/schedule';
import { ISchedulePreference, IUpdateSchedulePreferencePayload } from '@/services/schedule/schedule.types';

// Zod schemas for validation
const TimeSlotSchema = z.object({
    startTime: z.string(),
    endTime: z.string(),
});

const FreeTimeSchema = z.object({
    Monday: z.array(TimeSlotSchema).optional(),
    Tuesday: z.array(TimeSlotSchema).optional(),
    Wednesday: z.array(TimeSlotSchema).optional(),
    Thursday: z.array(TimeSlotSchema).optional(),
    Friday: z.array(TimeSlotSchema).optional(),
    Saturday: z.array(TimeSlotSchema).optional(),
    Sunday: z.array(TimeSlotSchema).optional(),
});

const PreferencesSchema = z.object({
    studyMethods: z.array(z.string()),
    studyDuration: z.number(),
    interestedTopicTags: z.array(z.string()),
    onboardingCompletedAt: z.string(),
});

/**
 * Hook to fetch user's schedule preferences
 * @param shouldRun - Optional parameter to control when the fetch should run
 * @returns Object with data, loading, error, and refetch function
 */
export const useGetSchedulePreferences = (shouldRun = true) => {
    return useFetch<ISchedulePreference, ISchedulePreference>(() => scheduleService.getPreferences(), {
        shouldRun,
    });
};

/**
 * Hook to update user's schedule preferences
 * @returns Object with execute function, data, loading, error, and reset function
 */
export const useUpdateSchedulePreferences = () => {
    return usePost<IUpdateSchedulePreferencePayload, ISchedulePreference>(
        (data) => scheduleService.updatePreferences(data),
        'POST',
    );
};
