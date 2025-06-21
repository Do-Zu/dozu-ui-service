import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { progressApi } from '@/api/progress.api';
import { IDashboardStatistics, IProgressStatistics } from '@/types/progress';

export const useProgressStatistics = () => {
  const [data, setData] = useState<IProgressStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.isAuthenticated || !auth.accessToken) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await progressApi.getStatistics();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.isAuthenticated, auth.accessToken]);

  return { data, loading, error };
};

export const useDashboardStatistics = () => {
  const [data, setData] = useState<IDashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.isAuthenticated || !auth.accessToken) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await progressApi.getDashboardStatistics();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.isAuthenticated, auth.accessToken]);

  return { data, loading, error };
};

export const useDailyStudyRecords = (days: number = 7) => {
  const [data, setData] = useState<Array<{day: string, hours: number, date: string}> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.isAuthenticated || !auth.accessToken) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await progressApi.getDailyStudyRecords(days);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch daily study records');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days, auth.isAuthenticated, auth.accessToken]);

  return { data, loading, error };
};

export const useLearningMethodsDistribution = () => {
  const [data, setData] = useState<Array<{method: string, percentage: number, count: number}> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.isAuthenticated || !auth.accessToken) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await progressApi.getLearningMethodsDistribution();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch learning methods distribution');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.isAuthenticated, auth.accessToken]);

  return { data, loading, error };
};

export const useWeeklyComparison = () => {
  const [data, setData] = useState<{totalStudyHours: number, percentageChange: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.isAuthenticated || !auth.accessToken) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await progressApi.getWeeklyComparison();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weekly comparison');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.isAuthenticated, auth.accessToken]);

  return { data, loading, error };
};

export const useCompletedTopics = () => {
  const [data, setData] = useState<{completedTopics: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.isAuthenticated || !auth.accessToken) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await progressApi.getCompletedTopics();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch completed topics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.isAuthenticated, auth.accessToken]);

  return { data, loading, error };
}; 