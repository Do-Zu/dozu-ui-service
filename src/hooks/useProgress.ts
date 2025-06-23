import { useState, useEffect } from 'react';
import { progressService, IProgressCreate, IProgressUpdate, IProgressQuery } from '@/services/progress/progress.service';
import {
  IProgress,
  IProgressStatistics,
  IDashboardStatistics,
  IDailyStudyRecord,
  ContentType,
  ProgressStatus,
} from '@/types/progress';

// Query keys
export const progressKeys = {
  all: ['progress'] as const,
  lists: () => [...progressKeys.all, 'list'] as const,
  list: (filters: IProgressQuery) => [...progressKeys.lists(), filters] as const,
  details: () => [...progressKeys.all, 'detail'] as const,
  detail: (id: string) => [...progressKeys.details(), id] as const,
  statistics: () => [...progressKeys.all, 'statistics'] as const,
  dashboard: () => [...progressKeys.all, 'dashboard'] as const,
  dailyStudy: () => [...progressKeys.all, 'dailyStudy'] as const,
  learningMethods: () => [...progressKeys.all, 'learningMethods'] as const,
  weeklyComparison: () => [...progressKeys.all, 'weeklyComparison'] as const,
  completedTopics: () => [...progressKeys.all, 'completedTopics'] as const,
};

// CRUD hooks
export const useProgressList = (query: IProgressQuery = {}) => {
  const [data, setData] = useState<IProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await progressService.getAllProgress(query);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [query]);

  return { data, loading, error, refetch: fetchData };
};

export const useProgressById = (id: string) => {
  const [data, setData] = useState<IProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await progressService.getProgressById(id);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, loading, error, refetch: fetchData };
};

export const useCreateProgress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProgress = async (data: IProgressCreate) => {
    try {
      setLoading(true);
      setError(null);
      const result = await progressService.createProgress(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create progress';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createProgress, loading, error };
};

export const useUpdateProgress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProgress = async (id: string, data: IProgressUpdate) => {
    try {
      setLoading(true);
      setError(null);
      const result = await progressService.updateProgress(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update progress';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateProgress, loading, error };
};

export const useDeleteProgress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProgress = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await progressService.deleteProgress(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete progress';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteProgress, loading, error };
};

// Statistics hooks
export const useProgressStatistics = () => {
  const [data, setData] = useState<IProgressStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await progressService.getProgressStatistics();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

export const useDashboardStatistics = () => {
  const [data, setData] = useState<IDashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await progressService.getDashboardStatistics();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

export const useDailyStudyRecords = (days: number = 7) => {
  const [data, setData] = useState<Array<{ day: string; hours: number; date: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await progressService.getDailyStudyRecords(days);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch daily study records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  return { data, loading, error, refetch: fetchData };
};

export const useLearningMethodsDistribution = () => {
  const [data, setData] = useState<Array<{ method: ContentType; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await progressService.getLearningMethodsDistribution();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch learning methods distribution');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

export const useWeeklyComparison = () => {
  const [data, setData] = useState<{ currentWeek: number; previousWeek: number; percentageChange: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await progressService.getWeeklyComparison();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weekly comparison');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

export const useCompletedTopics = () => {
  const [data, setData] = useState<{ completedTopics: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await progressService.getCompletedTopics();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch completed topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}; 