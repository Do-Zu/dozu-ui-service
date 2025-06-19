import { postRequest } from '@/api/api';
import { callApiAsync } from '@/hooks/helper';
import { prepareDateForApi } from '@/utils/date/apiDateUtils';
import { ScheduleGenerateRequest, ScheduleGenerateResponse } from '../types/schedule.type';

// ===============================
// SERVICES
// ===============================

/**
 * Generates a study schedule for the specified user and date range
 *
 * @param request - Schedule generation request parameters
 * @returns Promise resolving to the generated schedule
 * @throws {Error} When the API request fails or returns an error
 *
 * ```
 */
export const generateSchedule = async (
  request: ScheduleGenerateRequest,
): Promise<ScheduleGenerateResponse> => {
  try {
    if (!request.fromDate || !request.toDate) {
      throw new Error('Both fromDate and toDate are required');
    }

    // Validate date format and range
    const fromDate = new Date(request.fromDate);
    const toDate = new Date(request.toDate);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new Error('Invalid date format. Please use ISO 8601 format with timezone offset');
    }

    if (fromDate >= toDate) {
      throw new Error('fromDate must be earlier than toDate');
    }

    // Make API request using the utility function
    const response = await postRequest<ScheduleGenerateRequest, ScheduleGenerateResponse>(
      '/schedule/generate',
      request,
    );

    return response;
  } catch (error) {
    // Enhanced error handling
    if (error instanceof Error) {
      throw new Error(`Schedule generation failed: ${error.message}`);
    }

    // Handle axios errors or other types
    throw new Error('An unexpected error occurred during schedule generation');
  }
};

/**
 * Alternative implementation using the callApiAsync helper
 * This version provides more control over the request configuration
 *
 * @param request - Schedule generation request parameters
 * @param options - Additional request options (headers, signal for cancellation)
 * @returns Promise resolving to the generated schedule
 */
export const generateScheduleWithOptions = async (
  request: ScheduleGenerateRequest,
  options?: {
    headers?: Record<string, string>;
    signal?: AbortSignal;
  },
): Promise<ScheduleGenerateResponse> => {
  try {
    if (!request.fromDate || !request.toDate) {
      throw new Error('Both fromDate and toDate are required');
    }

    const response = await callApiAsync<ScheduleGenerateResponse>('/schedule/generate', 'POST', {
      body: request,
      headers: options?.headers,
      signal: options?.signal,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Schedule generation failed: ${error.message}`);
    }

    throw new Error('An unexpected error occurred during schedule generation');
  }
};

// ===============================
// UTILITY FUNCTIONS
// ===============================

/**
 * Creates a properly formatted date range for API requests
 *
 * @param startDate - Start date (Date object or ISO string)
 * @param endDate - End date (Date object or ISO string)
 * @returns Object with formatted fromDate and toDate strings
 *
 * @example
 * ```typescript
 * const dateRange = createDateRange(
 *   new Date('2025-06-02'),
 *   new Date('2025-06-08')
 * );
 * // Returns: { fromDate: '2025-06-02T00:00:00+07:00', toDate: '2025-06-08T23:59:59+07:00' }
 * ```
 */
export const createDateRange = (
  startDate: Date | string,
  endDate: Date | string,
): { fromDate: string; toDate: string } => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Set start time to beginning of day
  start.setHours(0, 0, 0, 0);

  // Set end time to end of day
  end.setHours(23, 59, 59, 999);

  return {
    fromDate: prepareDateForApi(start),
    toDate: prepareDateForApi(end),
  };
};

/**
 * Creates a schedule generation request with sensible defaults
 *

 * @param startDate - Start date for the schedule
 * @param endDate - End date for the schedule
 * @param options - Optional parameters to override defaults
 * @returns Complete ScheduleGenerateRequest object
 */
export const createScheduleRequest = (
  startDate: Date | string,
  endDate: Date | string,
  options?: Partial<Omit<ScheduleGenerateRequest, 'fromDate' | 'toDate'>>,
): ScheduleGenerateRequest => {
  const dateRange = createDateRange(startDate, endDate);

  return {
    ...dateRange,
    preferences: {
      sessionDuration: 60, // 1 hour default
      breakDuration: 15, // 15 minutes default
      preferredTimes: ['morning', 'evening'],
      studyStyle: 'individual',
      studyMethods: ['small_chunks'],
      ...options?.preferences,
    },
  };
};

/**
 * Validates a schedule generation request
 *
 * @param request - Request to validate
 * @returns Array of validation errors (empty if valid)
 */
export const validateScheduleRequest = (request: ScheduleGenerateRequest): string[] => {
  const errors: string[] = [];

  if (!request.fromDate) {
    errors.push('fromDate is required');
  }

  if (!request.toDate) {
    errors.push('toDate is required');
  }

  if (request.fromDate && request.toDate) {
    const fromDate = new Date(request.fromDate);
    const toDate = new Date(request.toDate);

    if (isNaN(fromDate.getTime())) {
      errors.push('fromDate must be a valid ISO 8601 date string');
    }

    if (isNaN(toDate.getTime())) {
      errors.push('toDate must be a valid ISO 8601 date string');
    }

    if (fromDate >= toDate) {
      errors.push('fromDate must be earlier than toDate');
    }

    // Check if the date range is reasonable (not more than 1 year)
    const diffInDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffInDays > 365) {
      errors.push('Date range cannot exceed 365 days');
    }
  }

  return errors;
};

// ===============================
// EXPORT ALL TYPES
// ===============================

// Types are already exported with their interface declarations above
