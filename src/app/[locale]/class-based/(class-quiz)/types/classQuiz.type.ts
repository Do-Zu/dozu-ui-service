export type ClassQuizStatus = 'draft' | 'scheduled' | 'published' | 'closed';

export interface IClassQuizListItem {
  classQuizId: number;
  title: string;
  status: ClassQuizStatus;
  startAt: string | null;
  endAt: string | null;
  publishedAt: string | null;
  acceptingSubmissions: boolean | null;
  maxAttempts: number | null;
  submittedCount: number; 
  __createdForSort?: string; 
}

export type DraftItem =
  | { adHoc: true; text: string; choices: string[]; correctIndex: number }
  | { originQuestionId: number };

export interface IDraftJson {
  orderSeed?: string;
  items: {
    adHoc?: boolean;
    text: string;
    choices: string[];
    correctIndex: number;
  }[];
  meta?: Record<string, unknown>;
}

// === Teacher shapes ===
export interface ICreateClassQuizBody {
  teacherId: number;
  topicId?: number | null;
  title: string;
  content?: string;
  startAt?: string | null;
  endAt?: string | null;
  durationSeconds?: number | null;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleChoices?: boolean;
  showScoreToStudent?: boolean;
}

export interface IUpsertDraftBody {
  teacherId: number;
  draftJson: IDraftJson;
}
export interface IUpsertDraftResp {
  classQuizId: number;
  version: number;
  updatedAt: string;
}

export interface IUpdateSettingsBody {
  title?: string;
  content?: string;
  startAt?: string | null;
  endAt?: string | null;
  durationSeconds?: number | null;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleChoices?: boolean;
  showScoreToStudent?: boolean;
  acceptingSubmissions?: boolean;
  topicId?: number | null;
}

export interface IScheduleBody { startAt: string; endAt: string; }
export interface IPublishResp {
  status: 'published';
  classQuizVersionId: number;
  choicesShuffleSeed: string;
  questionsCount: number;
}

export type ITeacherClassQuizDetail = {
  classQuizId: number;
  title: string;
  content: string;
  startAt: string | null;
  endAt: string | null;
  durationSeconds: number | null;
};

// === Student shapes ===
export interface IPlayableMeta {
  classQuizId: number;
  classQuizVersionId: number;
  questionsCount: number;
  choicesShuffleSeed: string;
  durationSeconds: number | null;
  window: { startAt: string | null; endAt: string | null };
  rules: {
    maxAttempts: number | null;
    shuffleChoices: boolean | null;
    shuffleQuestions: boolean | null;
    acceptingSubmissions: boolean | null;
  };
  remainingAttempts: number;
}

export interface IStartAttemptResp {
  attemptId: number;
  classQuizVersionId: number;
  attemptEndAt: string | null;
  questionsCount: number;
  choicesShuffleSeed: string;
}

export interface ISaveAnswerBody {
  userId: number;
  snapshotQuestionIdx: number; // 1-based
  userAnswerIndex: number | null;
}
export interface ISaveAnswerResp {
  saved: {
    attemptId: number;
    snapshotQuestionIdx: number;
    userAnswerIndex: number | null;
    correct: boolean;
  };
}

export interface ISubmitAttemptResp {
  attemptId: number;
  score: number;          // 0..100
  correctCount: number;
  questionsCount: number;
  submittedAt: string;
}

export interface IMyAttemptRow {
  attemptId: number;
  classQuizId: number;
  title: string;
  status: 'in_progress' | 'submitted' | 'cancelled';
  score: number | null;
  correctCount: number | null;
  questionsCount: number | null;
  attemptStartedAt: string;
  submittedAt: string | null;
}

export interface IAttemptDetail {
  attemptId: number;
  status: 'in_progress' | 'submitted' | 'cancelled';
  classQuizVersion: {
    choicesShuffleSeed: string;
    snapshot: { orderSeed?: string; items: DraftItem[]; meta?: Record<string, unknown> };
    createdAt: string;
  };
  answers: Array<{
    snapshotQuestionIdx: number;
    userAnswerIndex: number | null;
    correct: boolean | null;
    answeredAt: string | null;
  }>;
}
