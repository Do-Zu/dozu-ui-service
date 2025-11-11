import { getRequest, postRequest } from '@/api/api';
import {
  IPlayableMeta, IStartAttemptResp, ISaveAnswerBody, ISaveAnswerResp,
  ISubmitAttemptResp, IMyAttemptRow, IAttemptDetail
} from '../types/classQuiz.type';

const BASE = '/student/class-quiz';

class ClassQuizStudentService {
  /** GET /student/class-quiz/class-quizzes/:classQuizId/playable */
  getPlayableMeta(classQuizId: number) {
    return getRequest<unknown, IPlayableMeta>(`${BASE}/class-quizzes/${classQuizId}/playable`)
      .then(r => {
        if (r.status !== 'success') throw new Error(r.message);
        return r.data;
      });
  }

  /** POST /student/class-quiz/class-quizzes/:classQuizId/attempts */
  startAttempt(classQuizId: number) {
    return postRequest<unknown, IStartAttemptResp>(`${BASE}/class-quizzes/${classQuizId}/attempts`, {})
      .then(r => {
        if (r.status !== 'created') throw new Error(r.message);
        return r.data;
      });
  }

  /** POST /student/class-quiz/class-quizzes/:classQuizId/attempts/:attemptId/answers */
  saveAnswer(classQuizId: number, attemptId: number, body: ISaveAnswerBody) {
    return postRequest<ISaveAnswerBody, ISaveAnswerResp>(
      `${BASE}/class-quizzes/${classQuizId}/attempts/${attemptId}/answers`,
      body,
    ).then(r => {
      if (r.status !== 'success') throw new Error(r.message);
      return r.data;
    });
  }

  /** POST /student/class-quiz/class-quizzes/:classQuizId/attempts/:attemptId/submit */
  submitAttempt(classQuizId: number, attemptId: number) {
    return postRequest<unknown, ISubmitAttemptResp>(
      `${BASE}/class-quizzes/${classQuizId}/attempts/${attemptId}/submit`,
      {},
    ).then(r => {
      if (r.status !== 'success') throw new Error(r.message);
      return r.data;
    });
  }

  /** GET /student/class-quiz/me/classes/:classId/quizzes */
  myAttempts(classId: number) {
    return getRequest<unknown, IMyAttemptRow[]>(`${BASE}/me/classes/${classId}/quizzes`)
      .then(r => {
        if (r.status !== 'success') throw new Error(r.message);
        return r.data;
      });
  }

  /** GET /student/class-quiz/class-quizzes/:classQuizId/attempts/:attemptId */
  attemptDetail(classQuizId: number, attemptId: number) {
    return getRequest<unknown, IAttemptDetail>(
      `${BASE}/class-quizzes/${classQuizId}/attempts/${attemptId}`,
    ).then(r => {
      if (r.status !== 'success') throw new Error(r.message);
      return r.data;
    });
  }
}

export default new ClassQuizStudentService();
