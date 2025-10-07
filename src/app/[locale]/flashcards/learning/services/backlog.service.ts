import { getRequest, postRequest, deleteRequest } from '@/api/api';
import type { ApiResponse } from '@/api/type';

export type BacklogSource = 'first_half' | 'second_half' | 'manual' | 'backlog_quiz';

export type BacklogReserveItem = {
  id: number;
  flashcardId: number;
  source: BacklogSource;
  orderIndex: number | null;
  front: string;
  back: string;
  imageUrl: string | null;
  topicName: string | null;
};

/** ---- DTOs ---- */
export type BacklogCountQueryDto = { topicId: number };
export type BacklogCountRes = { count: number };

export type BacklogAddReq = {
  topicId: number;
  items: Array<{
    flashcardId: number;
    source: BacklogSource;
    sessionEpoch?: number;
    orderIndex?: number;
  }>;
};
export type BacklogAddRes = { added: number; skipped: number };

export type BacklogReserveReq = {
  topicId: number;
  limit: number;
  clientRequestId: string; // uuid/nonce
};

export type BacklogReserveRes = { items: BacklogReserveItem[] };

export type BacklogCommitReq = { topicId: number; itemIds: number[] };
export type BacklogCommitRes = { updated: number };

export type BacklogReleaseReq = { topicId: number; itemIds: number[] };
export type BacklogReleaseRes = { updated: number };

export type BacklogClearRes = { cleared: number } | { ok: true } | void;

export const backlogService = {
  getCount: async (topicId: number) =>
    getRequest<never, BacklogCountRes>(`/backlog/count?topicId=${topicId}`),

  add: async (data: BacklogAddReq) =>
    postRequest<BacklogAddReq, BacklogAddRes>('/backlog/add', data),

  reserve: async (data: BacklogReserveReq) =>
    postRequest<BacklogReserveReq, BacklogReserveRes>('/backlog/reserve', data),

  commit: async (data: BacklogCommitReq) =>
    postRequest<BacklogCommitReq, BacklogCommitRes>('/backlog/commit', data),

  release: async (data: BacklogReleaseReq) =>
    postRequest<BacklogReleaseReq, BacklogReleaseRes>('/backlog/release', data),

  clear: async (topicId: number, force?: boolean) => {
    const q = new URLSearchParams({ topicId: String(topicId) });
    if (typeof force !== 'undefined') q.set('force', String(force));
    return deleteRequest<never, ApiResponse<BacklogClearRes>>(`/backlog/clear?${q.toString()}`);
  },
};
