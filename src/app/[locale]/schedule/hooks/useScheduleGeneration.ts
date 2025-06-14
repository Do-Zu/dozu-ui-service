import { useState, useCallback } from 'react';
import { generateSchedule } from '../services/schedule.service';
import { ScheduleGenerateResponse, ScheduleGenerateRequest } from '../types/schedule.type';

// ===============================
// HOOK STATE TYPES
// ===============================

interface UseScheduleGenerationState {
  data: ScheduleGenerateResponse | null;
  loading: boolean;
  error: string | null;
}

interface UseScheduleGenerationReturn extends UseScheduleGenerationState {
  generateUserSchedule: (
    request: ScheduleGenerateRequest,
  ) => Promise<ScheduleGenerateResponse | null>;
  generateWithOptions: (
    request: ScheduleGenerateRequest,
    options?: { headers?: Record<string, string>; signal?: AbortSignal },
  ) => Promise<ScheduleGenerateResponse | null>;

  validateRequest: (request: ScheduleGenerateRequest) => string[];
  reset: () => void;
  isSuccess: boolean;
  isPending: boolean;
  isFailed: boolean;
}

/**
 * Hook for managing multiple schedule generations
 *
 * Useful for generating schedules for multiple time periods or users
 */
export const useBatchScheduleGeneration = () => {
  const [schedules, setSchedules] = useState<Map<string, ScheduleGenerateResponse>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const generateBatch = useCallback(
    async (requests: Array<{ id: string; request: ScheduleGenerateRequest }>) => {
      // Start loading for all requests
      setLoading((prev) => {
        const newLoading = new Set(prev);
        requests.forEach((r) => newLoading.add(r.id));
        return newLoading;
      });

      // Clear previous errors
      setErrors((prev) => {
        const newErrors = new Map(prev);
        requests.forEach((r) => newErrors.delete(r.id));
        return newErrors;
      });

      // Generate all schedules concurrently
      const promises = requests.map(async ({ id, request }) => {
        try {
          const response = await generateSchedule(request);
          return { id, response, error: null };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return { id, response: null, error: errorMessage };
        }
      });

      const results = await Promise.all(promises);

      // Update state with results
      setSchedules((prev) => {
        const newSchedules = new Map(prev);
        results.forEach(({ id, response }) => {
          if (response) {
            newSchedules.set(id, response);
          }
        });
        return newSchedules;
      });

      setErrors((prev) => {
        const newErrors = new Map(prev);
        results.forEach(({ id, error }) => {
          if (error) {
            newErrors.set(id, error);
          }
        });
        return newErrors;
      });

      // Clear loading state
      setLoading((prev) => {
        const newLoading = new Set(prev);
        requests.forEach((r) => newLoading.delete(r.id));
        return newLoading;
      });

      return results;
    },
    [],
  );

  const getSchedule = useCallback((id: string) => schedules.get(id), [schedules]);
  const getError = useCallback((id: string) => errors.get(id), [errors]);
  const isLoading = useCallback((id: string) => loading.has(id), [loading]);

  const clearSchedule = useCallback((id: string) => {
    setSchedules((prev) => {
      const newSchedules = new Map(prev);
      newSchedules.delete(id);
      return newSchedules;
    });
    setErrors((prev) => {
      const newErrors = new Map(prev);
      newErrors.delete(id);
      return newErrors;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSchedules(new Map());
    setErrors(new Map());
    setLoading(new Set());
  }, []);

  return {
    schedules: Object.fromEntries(schedules),
    errors: Object.fromEntries(errors),
    generateBatch,
    getSchedule,
    getError,
    isLoading,
    clearSchedule,
    clearAll,
    totalSchedules: schedules.size,
    totalErrors: errors.size,
    isAnyLoading: loading.size > 0,
  };
};

export type { UseScheduleGenerationState, UseScheduleGenerationReturn };
