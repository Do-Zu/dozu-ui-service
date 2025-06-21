/**
 * Request payload for schedule generation
 */
export interface ScheduleGenerateRequest {
  /**
   * Start date for the schedule period
   * Format: ISO 8601 with timezone offset (e.g., "2025-06-02T00:00:00+07:00")
   */
  fromDate: string;
  /**
   * End date for the schedule period
   * Format: ISO 8601 with timezone offset (e.g., "2025-06-08T23:59:59+07:00")
   */
  toDate: string;
  /**
   * Optional: Additional parameters for schedule generation
   */
  preferences?: SchedulePreferences;
}

/**
 * User preferences for schedule generation
 */
export interface SchedulePreferences {
  /**
   * Preferred study time periods
   */
  preferredTimes?: ('morning' | 'afternoon' | 'evening')[];
  /**
   * Study session duration in minutes
   */
  sessionDuration?: number;
  /**
   * Break duration between sessions in minutes
   */
  breakDuration?: number;
  /**
   * Study style preferences
   */
  studyStyle?: 'individual' | 'group' | 'with_music';
  /**
   * Learning methods
   */
  studyMethods?: ('small_chunks' | 'marathon' | 'by_topic')[];
}

/**
 * Schedule generation response - matches actual API response structure
 */
export interface ScheduleGenerateResponse {
  /**
   * Response status
   */
  status: 'success' | 'error' | 'pending' | 'failed';
  /**
   * Response message
   */
  message: string;
  /**
   * HTTP status code
   */
  code: number;
  /**
   * Schedule data
   */
  data: ScheduleData;
}

/**
 * Schedule data structure
 */
export interface ScheduleData {
  /**
   * Schedules organized by date (YYYY-MM-DD format)
   */
  schedules: Record<string, IScheduleItem[]>;
  /**
   * Topics that couldn't be scheduled
   */
  waitingTopics: IScheduleItem[];
  /**
   * User's preferred learning session time
   */
  userPriorityDaySessionLearning: 'morning' | 'afternoon' | 'evening';
}

/**
 * Individual schedule item - matches actual API response structure
 */
export interface IScheduleItem {
  /**
   * Topic identifier
   */
  topicId: number;
  /**
   * Priority score
   */
  priority: number;
  /**
   * Start date and time (ISO string)
   */
  startTime: string;
  /**
   * End date and time (ISO string)
   */
  endTime: string;
  /**
   * Title/name of the topic
   */
  title: string;
  /**
   * Optional description
   */
  description: string | null;
  /**
   * Type of learning activity
   */
  type: 'flashcard' | 'question' | 'study' | 'review' | 'practice';
  /**
   * Number of items in this session
   */
  amountItem: number;
}

/**
 * Error response structure
 */
export interface ScheduleServiceError {
  /**
   * Error code
   */
  code: string;
  /**
   * Human-readable error message
   */
  message: string;
  /**
   * Additional error details
   */
  details?: Record<string, any>;
}