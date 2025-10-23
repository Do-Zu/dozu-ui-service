import { IActivity } from '@/types/activity';

export interface CreateActivityPayload {
  title: string;
  description: string;
  topicId: number;
  classId: number;
  contentType: 'multiple-choice' | 'flashcard' | 'quiz' | 'learning';
  dueDate: string;
  settings: {
    timeLimit?: number;
    attempts?: number;
    shuffleQuestions?: boolean;
    showCorrectAnswers?: boolean;
  };
}

export interface UpdateActivityPayload {
  id: string;
  title?: string;
  description?: string;
  dueDate?: string;
  settings?: {
    timeLimit?: number;
    attempts?: number;
    shuffleQuestions?: boolean;
    showCorrectAnswers?: boolean;
  };
}

export interface ActivityResponse {
  success: boolean;
  data?: IActivity;
  message?: string;
}

export interface ActivitiesResponse {
  success: boolean;
  data?: IActivity[];
  message?: string;
}

class ActivityService {
  private baseUrl = '/api/activity';

  /**
   * Create a new activity
   */
  async createActivity(payload: CreateActivityPayload): Promise<ActivityResponse> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create activity');
      }

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Error creating activity:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create activity'
      };
    }
  }

  /**
   * Get all activities for a class
   */
  async getActivitiesByClass(classId: number): Promise<ActivitiesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/class/${classId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch activities');
      }

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Error fetching activities:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch activities'
      };
    }
  }

  /**
   * Get activity by ID
   */
  async getActivityById(activityId: string): Promise<ActivityResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${activityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch activity');
      }

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Error fetching activity:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch activity'
      };
    }
  }

  /**
   * Update an activity
   */
  async updateActivity(payload: UpdateActivityPayload): Promise<ActivityResponse> {
    try {
      const { id, ...updateData } = payload;
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update activity');
      }

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Error updating activity:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update activity'
      };
    }
  }

  /**
   * Delete an activity
   */
  async deleteActivity(activityId: string): Promise<ActivityResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete activity');
      }

      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      console.error('Error deleting activity:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete activity'
      };
    }
  }

  /**
   * Get activity monitoring data
   */
  async getActivityMonitoringData(activityId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/${activityId}/monitoring`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch monitoring data');
      }

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch monitoring data'
      };
    }
  }

  /**
   * Start an activity for a student
   */
  async startActivity(activityId: string, studentId: string): Promise<ActivityResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${activityId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ studentId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to start activity');
      }

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Error starting activity:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to start activity'
      };
    }
  }

  /**
   * Submit activity results
   */
  async submitActivityResults(activityId: string, results: {
    studentId: string;
    answers: any[];
    timeSpent: number;
    score: number;
  }): Promise<ActivityResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${activityId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(results),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit results');
      }

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Error submitting results:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit results'
      };
    }
  }
}

const activityService = new ActivityService();
export default activityService;
