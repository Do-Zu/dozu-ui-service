import { getRequest, postRequest, putRequest, deleteRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import {
  IProgress,
  IProgressStatistics,
  IDashboardStatistics,
  IDailyStudyRecord,
  ContentType,
  ProgressStatus,
} from '@/types/progress';

export interface IProgressCreate {
  userId: string;
  topicId: string; // Changed from contentId to topicId to match server schema
  contentType: ContentType;
  status?: ProgressStatus;
  completionPercentage?: number;
  score?: number;
  metadata?: {
    attempts?: number;
    timeSpent?: number;
    lastPosition?: number;
    answers?: Record<string, any>;
    notes?: string;
  };
}

export interface IProgressUpdate {
  status?: ProgressStatus;
  completionPercentage?: number;
  score?: number;
  lastInteractionAt?: Date;
  metadata?: {
    attempts?: number;
    timeSpent?: number;
    lastPosition?: number;
    answers?: Record<string, any>;
    notes?: string;
  };
}

export interface IProgressQuery {
  userId?: string;
  contentId?: string;
  contentType?: ContentType;
  status?: ProgressStatus;
  fromDate?: Date;
  toDate?: Date;
  minCompletionPercentage?: number;
  maxCompletionPercentage?: number;
}

export interface IWeeklyComparison {
  currentWeek: number;
  previousWeek: number;
  percentageChange: number;
}

export interface ICompletedTopicsResponse {
  completedTopics: number;
}

export interface ILearningMethodsDistribution {
  method: ContentType;
  count: number;
}

class ProgressService {
  // CRUD operations
  async getAllProgress(query: IProgressQuery = {}): Promise<IProgress[]> {
    const queryParams = new URLSearchParams();
    
    if (query.userId) queryParams.append('userId', query.userId);
    if (query.contentId) queryParams.append('contentId', query.contentId);
    if (query.contentType) queryParams.append('contentType', query.contentType);
    if (query.status) queryParams.append('status', query.status);
    if (query.fromDate) queryParams.append('fromDate', query.fromDate.toISOString());
    if (query.toDate) queryParams.append('toDate', query.toDate.toISOString());
    if (query.minCompletionPercentage) queryParams.append('minCompletionPercentage', query.minCompletionPercentage.toString());
    if (query.maxCompletionPercentage) queryParams.append('maxCompletionPercentage', query.maxCompletionPercentage.toString());

    const url = `/progress${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await getRequest<IProgress[], IProgress[]>(url);
    return response.data;
  }

  async getProgressById(id: string): Promise<IProgress> {
    const response = await getRequest<IProgress, IProgress>(`/progress/${id}`);
    return response.data;
  }

  async createProgress(data: IProgressCreate): Promise<IProgress> {
    console.log('ProgressService: Creating progress with data:', JSON.stringify(data, null, 2));
    const response = await postRequest<IProgressCreate, IProgress>('/progress', data);
    console.log('ProgressService: API response:', response);
    return response.data;
  }

  async updateProgress(id: string, data: IProgressUpdate): Promise<IProgress> {
    const response = await putRequest<IProgressUpdate, IProgress>(`/progress/${id}`, data);
    return response.data;
  }

  async deleteProgress(id: string): Promise<IProgress> {
    const response = await deleteRequest<never, IProgress>(`/progress/${id}`);
    return response;
  }

  // Statistics and analytics
  async getProgressStatistics(): Promise<IProgressStatistics> {
    const response = await getRequest<IProgressStatistics, IProgressStatistics>('/progress/overview');
    return response.data;
  }

  async getDashboardStatistics(): Promise<IDashboardStatistics> {
    const response = await getRequest<IDashboardStatistics, IDashboardStatistics>('/progress/dashboard');
    return response.data;
  }

  async getDailyStudyRecords(days: number = 7): Promise<Array<{ day: string; hours: number; date: string }>> {
    const response = await getRequest<Array<{ day: string; hours: number; date: string }>, Array<{ day: string; hours: number; date: string }>>(`/progress/daily-study?days=${days}`);
    return response.data;
  }

  async getLearningMethodsDistribution(): Promise<ILearningMethodsDistribution[]> {
    const response = await getRequest<ILearningMethodsDistribution[], ILearningMethodsDistribution[]>('/progress/learning-methods');
    return response.data;
  }

  async getWeeklyComparison(): Promise<IWeeklyComparison> {
    const response = await getRequest<IWeeklyComparison, IWeeklyComparison>('/progress/weekly-comparison');
    return response.data;
  }

  async getCompletedTopics(): Promise<ICompletedTopicsResponse> {
    const response = await getRequest<ICompletedTopicsResponse, ICompletedTopicsResponse>('/progress/completed-topics');
    return response.data;
  }
}

export const progressService = new ProgressService(); 