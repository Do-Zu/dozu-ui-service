'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleConvertToQuestionsEdited } from '@/app/[locale]/question/utils/handleConvertToQuestionsEdited';
import { IQuestionsFromSSERaw } from '@/app/[locale]/generate/types';
import { writeLocalQuiz } from '@/app/[locale]/quiz/utils/localQuiz.storage';
import { buildPayloadFromLearnedFlashcards } from '@/app/[locale]/question/utils/buildGenPayload';

// FE Backlog client (BE returns enriched data)
import { backlogService } from '../services/backlog.service';
import type {
  BacklogReserveItem,
  BacklogAddReq,
  BacklogReserveReq,
  BacklogCommitReq,
  BacklogReleaseReq,
} from '../services/backlog.service';

export type QuizCard = {
  flashcardId: number | string;
  front: string;
  back: string;
  imageUrl?: string | null;
  topicName?: string | null;
};

type HalfStatus = 'pending' | 'quizzed' | 'deferred';
type PromptVariant = 'half' | 'full';
type PendingAction = 'half' | 'onlySecond' | 'catchUpAll' | 'backlog' | null;

type UseQuizMilestonesParams = {
  topicId: string;
  regenerate: (payload: any, type: 'quiz') => Promise<void>;
  sseData: any;
  sseStatus: string;
  loading: boolean;
  chunkRatio?: number;
};

/* ---------- localStorage: ONLY keep baseline/progress status UI ---------- */
const keyBaseline = (topicId: string) => `progressive_quiz_baseline_total:${topicId}`;
const keyLastRemaining = (topicId: string) => `progressive_quiz_last_remaining:${topicId}`;
const keyHalf = (topicId: string, which: 'first' | 'second') =>
  `progressive_quiz_half_status:${topicId}:${which}`;

const readNum = (key: string, def = 0) => {
  if (typeof window === 'undefined') return def;
  const raw = window.localStorage.getItem(key);
  const n = raw ? parseInt(raw, 10) : def;
  return Number.isFinite(n) ? n : def;
};
const writeNum = (key: string, n: number) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, String(n));
};

const readBaseline = (topicId: string) => readNum(keyBaseline(topicId), 0);
const writeBaseline = (topicId: string, n: number) => writeNum(keyBaseline(topicId), n);

const readLastRemaining = (topicId: string) => readNum(keyLastRemaining(topicId), 0);
const writeLastRemaining = (topicId: string, n: number) => writeNum(keyLastRemaining(topicId), n);

const loadStatus = (topicId: string, which: 'first' | 'second'): HalfStatus => {
  if (typeof window === 'undefined') return 'pending';
  const raw = window.localStorage.getItem(keyHalf(topicId, which));
  return (raw as HalfStatus) || 'pending';
};
const saveStatus = (topicId: string, which: 'first' | 'second', val: HalfStatus) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(keyHalf(topicId, which), val);
};

/* ---------- helpers ---------- */
const dedupeById = (arr: QuizCard[]) => {
  const seen = new Set<string>();
  return arr.filter((c) => {
    const id = String(c.flashcardId);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

type DueCardLike = {
  flashcardId: number;
  front: string;
  back: string;
  imageUrl?: string | null;
  topicName?: string | null;
};
const normalizeToDue = (c: QuizCard): DueCardLike => ({
  flashcardId: typeof c.flashcardId === 'string' ? Number(c.flashcardId) : c.flashcardId,
  front: c.front,
  back: c.back,
  imageUrl: c.imageUrl ?? null,
  topicName: c.topicName ?? null,
});
const buildPayloadFromQuizCards = (topicId: string, cards: QuizCard[]) => {
  const normalized = cards.map(normalizeToDue);
  return buildPayloadFromLearnedFlashcards(topicId, normalized as any);
};

export function useQuizMilestones({
  topicId,
  regenerate,
  sseData,
  sseStatus,
  loading,
  chunkRatio = 0.5,
}: UseQuizMilestonesParams) {
  const router = useRouter();
  const [sessionEpoch, setSessionEpoch] = useState<number>(0);

  // Baseline (persisted UI state)
  const [baselineTotal, setBaselineTotal] = useState<number>(() => readBaseline(topicId));
  const [lastRemaining, setLastRemaining] = useState<number>(() => readLastRemaining(topicId));
  const [firstHalfStatus, setFirstHalfStatus] = useState<HalfStatus>(() =>
    loadStatus(topicId, 'first'),
  );
  const [secondHalfStatus, setSecondHalfStatus] = useState<HalfStatus>(() =>
    loadStatus(topicId, 'second'),
  );

  // Backlog count from BE
  const [backlogCount, setBacklogCount] = useState<number>(0);
  const refreshBacklogCount = useCallback(async () => {
    try {
      const res = await backlogService.getCount(Number(topicId));
      setBacklogCount(res.data?.count ?? 0);
    } catch {
      // ignore
    }
  }, [topicId]);

  useEffect(() => {
    writeBaseline(topicId, baselineTotal);
  }, [topicId, baselineTotal]);
  useEffect(() => {
    writeLastRemaining(topicId, lastRemaining);
  }, [topicId, lastRemaining]);
  useEffect(() => saveStatus(topicId, 'first', firstHalfStatus), [topicId, firstHalfStatus]);
  useEffect(() => saveStatus(topicId, 'second', secondHalfStatus), [topicId, secondHalfStatus]);

  // UI Prompt
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptVariant, setPromptVariant] = useState<PromptVariant>('half');
  const showCatchUp = useMemo(() => firstHalfStatus !== 'quizzed', [firstHalfStatus]);

  // Queue chunk/cards
  const [queuedChunkCards, setQueuedChunkCards] = useState<QuizCard[] | null>(null);
  const [queuedChunkNumber, setQueuedChunkNumber] = useState<number | null>(null); // 1: 50%, 2: 100%

  // SSE pending
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [pendingChunk, setPendingChunk] = useState<number | null>(null);

  // Baseline split
  const [t50, t100] = useMemo(() => {
    if (baselineTotal <= 0) return [0, 0] as const;
    const half = Math.ceil(baselineTotal * chunkRatio);
    return [half, baselineTotal] as const;
  }, [baselineTotal, chunkRatio]);

  const percentLabel = promptVariant === 'half' ? Math.round(chunkRatio * 100) : 100;
  const isGenerating = pendingChunk !== null && (loading || sseStatus === 'open');

  // Baseline order (lock)
  const [baselineOrder, setBaselineOrder] = useState<QuizCard[]>([]);

  /* ---------- session helpers ---------- */
  const closeSession = useCallback(() => {
    setBaselineTotal(0);
    setFirstHalfStatus('pending');
    setSecondHalfStatus('pending');
    setPromptOpen(false);
    setQueuedChunkCards(null);
    setQueuedChunkNumber(null);
    setLastRemaining(0);
    setBaselineOrder([]);
    setSessionEpoch((x) => x + 1);
  }, []);

  /* ---------- API for Page: fix/reset baseline ---------- */
  const ensureBaseline = (currentRemainingCount: number, baselineCards?: QuizCard[]) => {
    if (currentRemainingCount < 0) return;
    setLastRemaining(currentRemainingCount);
    if (currentRemainingCount === 0) return;

    const resetTo = () => {
      setBaselineTotal(currentRemainingCount);
      setFirstHalfStatus('pending');
      setSecondHalfStatus('pending');
      setPromptOpen(false);
      setQueuedChunkCards(null);
      setQueuedChunkNumber(null);
      setBaselineOrder(baselineCards ? dedupeById(baselineCards) : []);
      setSessionEpoch((x) => x + 1);
    };

    if (baselineTotal === 0) {
      resetTo();
      return;
    }
    if (currentRemainingCount > baselineTotal || currentRemainingCount > lastRemaining) {
      resetTo();
    }
  };

  /* ---------- progress ---------- */
  const onStudiedProgress = (studied: QuizCard[], currentRemainingCount: number) => {
    if (!baselineTotal || isGenerating || promptOpen) return;

    setLastRemaining(currentRemainingCount);
    const studiedSoFar = baselineTotal - currentRemainingCount;

    // 50%
    if (t50 > 0 && studiedSoFar >= t50 && firstHalfStatus === 'pending') {
      const hasBaseline = baselineOrder.length >= t50;
      const firstSlice = dedupeById((hasBaseline ? baselineOrder : studied).slice(0, t50));
      if (!firstSlice.length) return;

      setQueuedChunkCards(firstSlice);
      setQueuedChunkNumber(1);
      setPromptVariant('half');
      setPromptOpen(true);
      return;
    }

    // 100%
    if (t100 > 0 && studiedSoFar >= t100 && secondHalfStatus === 'pending') {
      setQueuedChunkCards(null);
      setQueuedChunkNumber(2);
      setPromptVariant('full');
      setPromptOpen(true);
    }
  };

  /* ---------- 50% actions ---------- */
  const confirmHalfQuiz = async () => {
    if (queuedChunkNumber !== 1 || !queuedChunkCards?.length) {
      setPromptOpen(false);
      return;
    }
    const payload = buildPayloadFromQuizCards(topicId, queuedChunkCards);
    setPendingChunk(1);
    setPendingAction('half');
    setPromptOpen(false);
    setQueuedChunkCards(null);
    setQueuedChunkNumber(null);
    await regenerate(payload, 'quiz');
  };

  // LATER @50% → push thẳng lên BE backlog (source = 'first_half')
  const skipHalfQuiz = async () => {
    if (queuedChunkNumber === 1 && queuedChunkCards?.length) {
      const addReq: BacklogAddReq = {
        topicId: Number(topicId),
        items: queuedChunkCards.map((c, idx) => ({
          flashcardId: Number(c.flashcardId),
          source: 'first_half',
          sessionEpoch,
          orderIndex: idx,
        })),
      };
      try {
        await backlogService.add(addReq);
      } finally {
        await refreshBacklogCount();
      }
    }
    setFirstHalfStatus('deferred');
    setPromptOpen(false);
    setQueuedChunkCards(null);
    setQueuedChunkNumber(null);
  };

  /* ---------- 100% actions ---------- */
  const getFullRanges = () => ({
    onlySecond: { start: Math.max(0, t50), end: t100 },
    catchUpAll: { start: 0, end: t100 },
  });

  const getFullCards = () => {
    const onlySecond = dedupeById(baselineOrder.slice(t50, t100));
    const catchUpAll = dedupeById(baselineOrder.slice(0, t100));
    return { onlySecond, catchUpAll };
  };

  const startFullOnlySecond = async (cards: QuizCard[]) => {
    if (!cards?.length) {
      setPromptOpen(false);
      return;
    }
    const payload = buildPayloadFromQuizCards(topicId, cards);
    setPendingChunk(2);
    setPendingAction('onlySecond');
    setPromptOpen(false);
    await regenerate(payload, 'quiz');
  };

  const startFullCatchUpAll = async (cards: QuizCard[]) => {
    if (!cards?.length) {
      setPromptOpen(false);
      return;
    }
    const payload = buildPayloadFromQuizCards(topicId, cards);
    setPendingChunk(2);
    setPendingAction('catchUpAll');
    setPromptOpen(false);
    await regenerate(payload, 'quiz');
  };

  // LATER @100% → push nửa sau lên BE (source='second_half'), nửa trước đã đẩy lúc 50% nếu có
  const skipFullQuiz = async (secondHalfCards: QuizCard[]) => {
    let second = secondHalfCards;
    if (!second?.length && baselineOrder.length >= t100) {
      second = dedupeById(baselineOrder.slice(t50, t100));
    }
    if (second?.length) {
      const addReq: BacklogAddReq = {
        topicId: Number(topicId),
        items: second.map((c, idx) => ({
          flashcardId: Number(c.flashcardId),
          source: 'second_half',
          sessionEpoch,
          orderIndex: idx,
        })),
      };
      try {
        await backlogService.add(addReq);
      } finally {
        await refreshBacklogCount();
      }
    }

    setSecondHalfStatus('deferred');
    setPromptOpen(false);
    setQueuedChunkCards(null);
    setQueuedChunkNumber(null);
    closeSession();
  };

  /* ---------- CTA Backlog: reserve → generate → commit/release ---------- */
  const [reservedIdsForBacklog, setReservedIdsForBacklog] = useState<number[] | null>(null);
  const inFlightReserveRef = useRef<string | null>(null);

  const startBacklogQuiz = async () => {
    if (isGenerating) return;

    // 1) reserve từ BE
    const clientRequestId = `bl-${Math.random().toString(36).slice(2, 10)}`;
    inFlightReserveRef.current = clientRequestId;

    let reserved: BacklogReserveItem[] = [];
    try {
      const res = await backlogService.reserve({
        topicId: Number(topicId),
        limit: 80,
        clientRequestId,
      } as BacklogReserveReq);
      reserved = res.data?.items ?? [];
    } catch {
      await refreshBacklogCount();
      return;
    }

    if (!reserved.length) {
      await refreshBacklogCount();
      return;
    }

    // 2) BE đã enrich → map trực tiếp thành QuizCard
    const cards: QuizCard[] = reserved.map((r) => ({
      flashcardId: r.flashcardId,
      front: r.front,
      back: r.back,
      imageUrl: r.imageUrl ?? null,
      topicName: r.topicName ?? null,
    }));

    const payload = buildPayloadFromQuizCards(topicId, cards);

    setPendingChunk(3);
    setPendingAction('backlog');
    setPromptOpen(false);
    setReservedIdsForBacklog(reserved.map((r) => r.id));

    try {
      await regenerate(payload, 'quiz');
    } catch {
      // lỗi trước khi SSE → release ngay
      try {
        if (reserved.length) {
          await backlogService.release({
            topicId: Number(topicId),
            itemIds: reserved.map((r) => r.id),
          } as BacklogReleaseReq);
        }
      } finally {
        await refreshBacklogCount();
      }
      setReservedIdsForBacklog(null);
      setPendingAction(null);
      setPendingChunk(null);
    }
  };

  // đồng bộ count theo vòng đời phiên
  useEffect(() => {
    refreshBacklogCount();
  }, [sessionEpoch, topicId, refreshBacklogCount]);

  /* ---------- SSE complete ---------- */
  useEffect(() => {
    if (pendingChunk === null) return;

    const raw = (sseData as any)?.data?.data as IQuestionsFromSSERaw | undefined;
    const payloadStatus = (sseData as any)?.data?.status ?? (sseData as any)?.status;
    const terminal = new Set(['completed', 'closed', 'error', 'failed']);
    const done = terminal.has(sseStatus) || terminal.has(payloadStatus);
    if (!done) return;

    const hasQuestions = Array.isArray(raw) && raw.length > 0;

    // Backlog: commit/release theo kết quả
    const finishBacklog = async (commit: boolean) => {
      const ids = reservedIdsForBacklog ?? [];
      setReservedIdsForBacklog(null);
      if (!ids.length) return;
      try {
        if (commit) {
          await backlogService.commit({ topicId: Number(topicId), itemIds: ids } as BacklogCommitReq);
        } else {
          await backlogService.release({ topicId: Number(topicId), itemIds: ids } as BacklogReleaseReq);
        }
      } finally {
        await refreshBacklogCount();
      }
    };

    if (!hasQuestions) {
      if (pendingAction === 'backlog') {
        finishBacklog(false).finally(() => void 0);
      }
      setPendingAction(null);
      setPendingChunk(null);
      setPromptOpen(false);
      return;
    }

    const parsed = handleConvertToQuestionsEdited({ type: 'generative', questionsProp: raw });
    const toStore = parsed.map((q) => ({
      questionText: q.questionText,
      choices: q.choices,
      correctIndex: q.correctIndex,
    }));
    writeLocalQuiz(topicId, toStore);

    if (pendingAction === 'half') {
      setFirstHalfStatus('quizzed');
    } else if (pendingAction === 'onlySecond') {
      setSecondHalfStatus('quizzed');
      closeSession();
    } else if (pendingAction === 'catchUpAll') {
      setFirstHalfStatus('quizzed');
      setSecondHalfStatus('quizzed');
      closeSession();
    } else if (pendingAction === 'backlog') {
      finishBacklog(true).finally(() => void 0);
    }

    const chunk = pendingChunk;
    setPendingAction(null);
    setPendingChunk(null);
    router.push(`/quiz/local?topicId=${topicId}&chunk=${chunk}`);
  }, [
    sseStatus,
    sseData,
    pendingChunk,
    pendingAction,
    topicId,
    router,
    closeSession,
    refreshBacklogCount,
    reservedIdsForBacklog,
  ]);

  return {
    // UI state
    promptOpen,
    promptVariant,
    percentLabel,
    isGenerating,
    showCatchUp,

    // HALF
    confirmHalfQuiz,
    skipHalfQuiz,

    // FULL
    getFullRanges,
    getFullCards,
    startFullOnlySecond,
    startFullCatchUpAll,
    skipFullQuiz,

    // Backlog
    backlogCount,
    startBacklogQuiz,

    // Page API
    ensureBaseline,
    onStudiedProgress,

    sessionEpoch,
  };
}
