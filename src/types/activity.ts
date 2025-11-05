export interface IActivity {
  id: string;
  title: string;
  description: string;
  topicId: number;
  topicName: string;
  classId: number;
  dueDate: string;
  createdAt: string;
  status: 'active' | 'completed' | 'draft';
  totalStudents: number;
  completedStudents: number;
  inProgressStudents: number;
  averageScore: number;
  quizType: 'multiple-choice' | 'flashcard' | 'quiz' | 'learning';
}

export interface ActivityDetails {
  id: string;
  title: string;
  description: string;
  topicId: number;
  topicName: string;
  classId: number;
  dueDate: string;
  createdAt: string;
  status: 'active' | 'completed' | 'draft';
  totalStudents: number;
  completedStudents: number;
  inProgressStudents: number;
  notStartedStudents: number;
  totalQuestions: number;
  averageScore: number;
  quizType: 'multiple-choice' | 'flashcard' | 'quiz' | 'learning';
}

export interface StudentQuizProgress {
  studentId: string;
  studentName: string;
  status: 'completed' | 'in-progress' | 'not-started';
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  totalAnswers: number;
  accuracy: number;
  timeSpent: number; // in minutes
  lastActivity: string;
  score: number;
  answers: any[];
}

export interface QuestionPerformance {
  questionId: string;
  questionText: string;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  averageTime: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
  accuracyLevel: string;
  accuracyPercentage: number;
  definition: string;
}

export interface PerformanceBreakdown {
  excellent: number; // > 80%
  good: number; // 60-80%
  average: number; // 40-60%
  poor: number; // < 40%
  notStarted: number; // not started
  totalTerms: number;
  thuongSai: number;
  doiLucSai: number;
  itKhiSai: number;
  chuaBatDau: number;
}

export interface ActivityMonitorData {
  activity: ActivityDetails;
  students: StudentQuizProgress[];
  performance: PerformanceBreakdown;
  questions: QuestionPerformance[];
}