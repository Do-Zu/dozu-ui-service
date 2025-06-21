import { getRequest } from './api';
import { IDashboardStatistics, IProgressStatistics } from '../types/progress';

// Progress API endpoints
const PROGRESS_BASE_URL = '/progress';

export const progressApi = {
  // Test endpoint
  test: async (): Promise<{message: string, timestamp: string}> => {
    return getRequest<{message: string, timestamp: string}>(`${PROGRESS_BASE_URL}/test`);
  },

  // Auth test endpoint
  authTest: async (): Promise<{message: string, timestamp: string, user: string}> => {
    return getRequest<{message: string, timestamp: string, user: string}>(`${PROGRESS_BASE_URL}/auth-test`);
  },

  // Get general progress statistics
  getStatistics: async (): Promise<IProgressStatistics> => {
    return getRequest<IProgressStatistics>(`${PROGRESS_BASE_URL}/statistics`);
  },

  // Get dashboard statistics
  getDashboardStatistics: async (): Promise<IDashboardStatistics> => {
    return getRequest<IDashboardStatistics>(`${PROGRESS_BASE_URL}/dashboard`);
  },

  // Get daily study records
  getDailyStudyRecords: async (days: number = 7): Promise<Array<{day: string, hours: number, date: string}>> => {
    return getRequest<Array<{day: string, hours: number, date: string}>>(`${PROGRESS_BASE_URL}/daily-study?days=${days}`);
  },

  // Get learning methods distribution
  getLearningMethodsDistribution: async (): Promise<Array<{method: string, percentage: number, count: number}>> => {
    return getRequest<Array<{method: string, percentage: number, count: number}>>(`${PROGRESS_BASE_URL}/learning-methods`);
  },

  // Get weekly comparison
  getWeeklyComparison: async (): Promise<{totalStudyHours: number, percentageChange: number}> => {
    return getRequest<{totalStudyHours: number, percentageChange: number}>(`${PROGRESS_BASE_URL}/weekly-comparison`);
  },

  // Get completed topics count
  getCompletedTopics: async (): Promise<{completedTopics: number}> => {
    return getRequest<{completedTopics: number}>(`${PROGRESS_BASE_URL}/completed-topics`);
  },
}; 