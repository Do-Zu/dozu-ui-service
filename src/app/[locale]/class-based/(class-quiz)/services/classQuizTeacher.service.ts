import { deleteRequest, getRequest, postRequest, putRequest, patchRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { IDraftJson } from '../types/classQuiz.type';
import {
  ICreateClassQuizBody,
  IUpsertDraftBody, IUpsertDraftResp,
  IUpdateSettingsBody, IScheduleBody, IPublishResp,
  IClassQuizListItem, ClassQuizStatus, ITeacherClassQuizDetail
} from '../types/classQuiz.type';

const BASE = '/teacher/class-quiz';

type IGetDraftResp = {
  draftJson: IDraftJson | null;
  version: number | null;
  updatedAt: string | null;
};
class ClassQuizTeacherService {
  /** POST /teacher/class-quiz/classes/:classId/quizzes */
  createClassQuiz(classId: number, body: ICreateClassQuizBody) {
    return postRequest<ICreateClassQuizBody, { classQuizId: number; status: ClassQuizStatus }>(
      `${BASE}/classes/${classId}/quizzes`,
      body,
    ).then(r => {
      if (r.status !== 'created') throw new Error(r.message);
      return r.data;
    });
  }

  isEmptyStatus(status: any): boolean {
  return status === 'not_found' || status === 'no_content';
}

  /** GET /teacher/class-quiz/classes/:classId/quizzes?status=... */
async listClassQuizzes(classId: number, status?: ClassQuizStatus) {
  const qs = status ? `?status=${status}` : '';

  try {
    const r = await getRequest<unknown, IClassQuizListItem[]>(`${BASE}/classes/${classId}/quizzes${qs}`);

    if (r.status === 'success' && Array.isArray(r.data)) {
      return r.data.map(x => ({
        ...x,
        __createdForSort:
          x.publishedAt ?? x.startAt ?? x.endAt ?? new Date().toISOString(),
      }));
    }

    if (this.isEmptyStatus(r.status)) return [];

    throw new Error(r.message || 'Failed to load quizzes');
  } catch (e: any) {
    const http = e?.response?.status ?? e?.status;

    if (http === 404 || http === 204) return [];

    throw e;
  }
}



  /** PUT /teacher/class-quiz/class-quizzes/:classQuizId/draft */
  upsertDraft(classQuizId: number, body: IUpsertDraftBody) {
    return putRequest<IUpsertDraftBody, IUpsertDraftResp>(`${BASE}/class-quizzes/${classQuizId}/draft`, body)
      .then(r => {
        if (r.status !== 'success') throw new Error(r.message);
        return r.data;
      });
  }

  /** PATCH /teacher/class-quiz/class-quizzes/:classQuizId/settings */
  updateSettings(classQuizId: number, body: IUpdateSettingsBody) {
    return patchRequest<IUpdateSettingsBody, any>(`${BASE}/class-quizzes/${classQuizId}/settings`, body)
      .then(r => {
        if (r.status !== 'success') throw new Error(r.message);
        return r.data;
      });
  }
    /** GET /teacher/class-quiz/class-quizzes/:classQuizId/draft */
  getDraft(classQuizId: number) {
    return getRequest<unknown, IGetDraftResp>(`${BASE}/class-quizzes/${classQuizId}/draft`)
      .then(r => {
        if (r.status !== 'success') throw new Error(r.message);
        return r.data; // { draftJson, version, updatedAt }
      });
  }

  /** GET /teacher/class-quiz/class-quizzes/:classQuizId */
  getClassQuiz(classQuizId: number) {
    return getRequest<unknown, ITeacherClassQuizDetail>(`${BASE}/class-quizzes/${classQuizId}`)
      .then(r => {
        if (r.status !== 'success') throw new Error(r.message);
        return r.data;
      });
  }

  /** POST schedule/publish/pause/resume/close */
  schedule(classQuizId: number, body: IScheduleBody) {
    return postRequest<IScheduleBody, { status: 'scheduled' }>(`${BASE}/class-quizzes/${classQuizId}/schedule`, body)
      .then(r => {
        if (r.status !== 'success') throw new Error(r.message);
        return r.data;
      });
  }
  publish(classQuizId: number) {
    return postRequest<unknown, IPublishResp>(`${BASE}/class-quizzes/${classQuizId}/publish`, {})
      .then(r => {
        if (r.status !== 'success') throw new Error(r.message);
        return r.data;
      });
  }
  pause(classQuizId: number) {
    return postRequest<unknown, { acceptingSubmissions: boolean }>(`${BASE}/class-quizzes/${classQuizId}/pause`, {})
      .then(r => {
        if (r.status !== 'success') throw new Error(r.message);
        return r.data;
      });
  }
  resume(classQuizId: number) {
    return postRequest<unknown, { acceptingSubmissions: boolean }>(`${BASE}/class-quizzes/${classQuizId}/resume`, {})
      .then(r => {
        if (r.status !== 'success') throw new Error(r.message);
        return r.data;
      });
  }
  close(classQuizId: number) {
    return postRequest<unknown, { status: 'closed'; acceptingSubmissions: false }>(`${BASE}/class-quizzes/${classQuizId}/close`, {})
      .then(r => {
        if (r.status !== 'success') throw new Error(r.message);
        return r.data;
      });
  }
}

export default new ClassQuizTeacherService();
