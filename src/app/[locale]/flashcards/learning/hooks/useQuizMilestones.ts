'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleConvertToQuestionsEdited } from '@/app/[locale]/question/utils/handleConvertToQuestionsEdited';
import { IQuestionsFromSSERaw } from '@/app/[locale]/generate/types';
import { writeLocalQuiz } from '@/app/[locale]/quiz/utils/localQuiz.storage';
import { buildPayloadFromLearnedFlashcards } from '@/app/[locale]/question/utils/buildGenPayload';

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

/* ---------- localStorage helpers ---------- */
const keyBaseline      = (topicId: string) => `progressive_quiz_baseline_total:${topicId}`;
const keyLastRemaining = (topicId: string) => `progressive_quiz_last_remaining:${topicId}`;
const keyHalf          = (topicId: string, which: 'first'|'second') => `progressive_quiz_half_status:${topicId}:${which}`;
const keyBacklog       = (topicId: string) => `progressive_quiz_backlog:${topicId}`;
const keyPendingFirst  = (topicId: string) => `progressive_quiz_pending_first:${topicId}`;

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

const loadStatus = (topicId: string, which: 'first'|'second'): HalfStatus => {
  if (typeof window === 'undefined') return 'pending';
  const raw = window.localStorage.getItem(keyHalf(topicId, which));
  return (raw as HalfStatus) || 'pending';
};
const saveStatus = (topicId: string, which: 'first'|'second', val: HalfStatus) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(keyHalf(topicId, which), val);
};

/* ---------- Backlog & pending-first helpers ---------- */
const readBacklog = (topicId: string): QuizCard[] => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(keyBacklog(topicId));
  if (!raw) return [];
  try { return JSON.parse(raw) as QuizCard[]; } catch { return []; }
};
const writeBacklog = (topicId: string, cards: QuizCard[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(keyBacklog(topicId), JSON.stringify(cards));
};

const readPendingFirst = (topicId: string): QuizCard[] => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(keyPendingFirst(topicId));
  if (!raw) return [];
  try { return JSON.parse(raw) as QuizCard[]; } catch { return []; }
};
const writePendingFirst = (topicId: string, cards: QuizCard[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(keyPendingFirst(topicId), JSON.stringify(cards));
};
const clearPendingFirst = (topicId: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(keyPendingFirst(topicId));
};

const dedupeById = (arr: QuizCard[]) => {
  const seen = new Set<string>();
  return arr.filter(c => {
    const id = String(c.flashcardId);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

/* ---------- Standardize QuizCard -> builder type needed ---------- */
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

/** Always use this helper instead of calling the builder directly to avoid type errors */
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

  // Baseline (persisted): “fixed” total of the session
  const [baselineTotal, setBaselineTotal] = useState<number>(() => readBaseline(topicId));
  const [lastRemaining, setLastRemaining] = useState<number>(() => readLastRemaining(topicId));

  // Persisted state
  const [firstHalfStatus, setFirstHalfStatus]   = useState<HalfStatus>(() => loadStatus(topicId, 'first'));
  const [secondHalfStatus, setSecondHalfStatus] = useState<HalfStatus>(() => loadStatus(topicId, 'second'));

  // Backlog (persisted)
  const [backlogCount, setBacklogCount] = useState<number>(() => readBacklog(topicId).length);

  useEffect(() => { writeBaseline(topicId, baselineTotal); }, [topicId, baselineTotal]);
  useEffect(() => { writeLastRemaining(topicId, lastRemaining); }, [topicId, lastRemaining]);
  useEffect(() => saveStatus(topicId, 'first',  firstHalfStatus),  [topicId, firstHalfStatus]);
  useEffect(() => saveStatus(topicId, 'second', secondHalfStatus), [topicId, secondHalfStatus]);

  // UI Prompt
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptVariant, setPromptVariant] = useState<PromptVariant>('half');

  // Show Catch-up option at 100% if first half is not quizzed
  const showCatchUp = useMemo(() => firstHalfStatus !== 'quizzed', [firstHalfStatus]);

  // Queue chunk/cards when user confirm
  const [queuedChunkCards, setQueuedChunkCards] = useState<QuizCard[] | null>(null);
  const [queuedChunkNumber, setQueuedChunkNumber] = useState<number | null>(null); // 1: 50%, 2: 100%

  // Monitor the generating action to update the state correctly when SSE is finished
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [pendingChunk, setPendingChunk] = useState<number | null>(null);

  // Milestones theo baseline
  const [t50, t100] = useMemo(() => {
    if (baselineTotal <= 0) return [0, 0] as const;
    const half = Math.ceil(baselineTotal * chunkRatio);
    return [half, baselineTotal] as const;
  }, [baselineTotal, chunkRatio]);

  const percentLabel = promptVariant === 'half' ? Math.round(chunkRatio * 100) : 100;
  const isGenerating = pendingChunk !== null && (loading || sseStatus === 'open');

  /* ---------- session helpers ---------- */
  const closeSession = () => {
    setBaselineTotal(0);
    setFirstHalfStatus('pending');
    setSecondHalfStatus('pending');
    setPromptOpen(false);
    setQueuedChunkCards(null);
    setQueuedChunkNumber(null);
    setLastRemaining(0);
    setSessionEpoch((x) => x + 1); // increase epoch at session close
  };

  /* ---------- Backlog API ---------- */
  const appendToBacklog = (cards: QuizCard[]) => {
    if (!cards?.length) return;
    const cur = readBacklog(topicId);
    const next = dedupeById([...cards, ...cur]); // newest first
    writeBacklog(topicId, next);
    setBacklogCount(next.length);
  };
  const clearBacklog = () => {
    writeBacklog(topicId, []);
    setBacklogCount(0);
  };
  const startBacklogQuiz = async () => {
    if (isGenerating) return;
    const cards = readBacklog(topicId);
    if (cards.length === 0) return;
    const payload = buildPayloadFromQuizCards(topicId, cards);
    setPendingChunk(3);                // 3 = type "backlog"
    setPendingAction('backlog');
    setPromptOpen(false);
    await regenerate(payload, 'quiz');
  };

  /* ---------- API for Page: fix/reset baseline ---------- */
  const ensureBaseline = (currentRemainingCount: number) => {
    if (currentRemainingCount < 0) return;

    setLastRemaining(currentRemainingCount); // monitor for increases

    if (currentRemainingCount === 0) return;

    if (baselineTotal === 0) {
      setBaselineTotal(currentRemainingCount);
      setFirstHalfStatus('pending');
      setSecondHalfStatus('pending');
      setSessionEpoch((x) => x + 1); // open a new session
      return;
    }

    if (currentRemainingCount > baselineTotal || currentRemainingCount > lastRemaining) {
      // Start new session: if old session kept pending-first then move to backlog
      const pf = readPendingFirst(topicId);
      if (pf.length) {
        appendToBacklog(pf);
        clearPendingFirst(topicId);
      }
      setBaselineTotal(currentRemainingCount);
      setFirstHalfStatus('pending');
      setSecondHalfStatus('pending');
      setPromptOpen(false);
      setQueuedChunkCards(null);
      setQueuedChunkNumber(null);
      setSessionEpoch((x) => x + 1); // open a new session
    }
  };

  /* ---------- API for Page: progress after each review ---------- */
  const onStudiedProgress = (
    studied: QuizCard[],
    currentRemainingCount: number
  ) => {
    if (!baselineTotal || isGenerating || promptOpen) return;

    setLastRemaining(currentRemainingCount);

    const studiedSoFar = baselineTotal - currentRemainingCount;

    // 50% if first half is pending
    if (t50 > 0 && studiedSoFar >= t50 && firstHalfStatus === 'pending') {
      const firstSlice = studied.length >= t50 ? studied.slice(0, t50) : studied.slice(); // safety
      setQueuedChunkCards(firstSlice);
      setQueuedChunkNumber(1);
      setPromptVariant('half');
      setPromptOpen(true);
      return;
    }

    // 100% if the second half is pending
    if (t100 > 0 && studiedSoFar >= t100 && secondHalfStatus === 'pending') {
      setQueuedChunkCards(null); // full: let Page slice
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

  const skipHalfQuiz = () => {
    // DO NOT push into backlog now — keep pending-first to decide at 100%
    if (queuedChunkNumber === 1 && queuedChunkCards?.length) {
      writePendingFirst(topicId, queuedChunkCards);
    }
    setFirstHalfStatus('deferred');
    setPromptOpen(false);
    setQueuedChunkCards(null);
    setQueuedChunkNumber(null);
  };

  /* ---------- 100% actions ---------- */
  const getFullRanges = () => ({
    onlySecond: { start: Math.max(0, t50), end: t100 }, // [t50, t100)
    catchUpAll: { start: 0, end: t100 },                // [0, t100)
  });

  // Only second: backlog first half (if Later), quiz second half
  const startFullOnlySecond = async (cards: QuizCard[]) => {
    if (!cards?.length) { setPromptOpen(false); return; }

    if (firstHalfStatus === 'deferred') {
      const pf = readPendingFirst(topicId);
      if (pf.length) appendToBacklog(pf);
      clearPendingFirst(topicId);
    }

    const payload = buildPayloadFromQuizCards(topicId, cards);
    setPendingChunk(2);
    setPendingAction('onlySecond');
    setPromptOpen(false);
    await regenerate(payload, 'quiz');
  };

  // Catch-up all: quiz both halves, clear pending-first
  const startFullCatchUpAll = async (cards: QuizCard[]) => {
    if (!cards?.length) { setPromptOpen(false); return; }
    clearPendingFirst(topicId);
    const payload = buildPayloadFromQuizCards(topicId, cards);
    setPendingChunk(2);
    setPendingAction('catchUpAll');
    setPromptOpen(false);
    await regenerate(payload, 'quiz');
  };

  // Later at 100%: backlog second half + (if any) first half pending, then close session
  const skipFullQuiz = (secondHalfCards: QuizCard[]) => {
    if (secondHalfCards?.length) appendToBacklog(secondHalfCards);

    if (firstHalfStatus === 'deferred') {
      const pf = readPendingFirst(topicId);
      if (pf.length) appendToBacklog(pf);
      clearPendingFirst(topicId);
    }

    setSecondHalfStatus('deferred');
    setPromptOpen(false);
    setQueuedChunkCards(null);
    setQueuedChunkNumber(null);
    closeSession();
  };

  /* ---------- SSE complete ---------- */
  useEffect(() => {
    if (pendingChunk === null) return;

    const raw = (sseData as any)?.data?.data as IQuestionsFromSSERaw | undefined;
    const payloadStatus = (sseData as any)?.data?.status ?? (sseData as any)?.status;
    const done = sseStatus === 'completed' || payloadStatus === 'completed';
    if (!done) return;
    if (!Array.isArray(raw) || raw.length === 0) return;

    const parsed = handleConvertToQuestionsEdited({ type: 'generative', questionsProp: raw });
    const toStore = parsed.map(q => ({
      questionText: q.questionText,
      choices: q.choices,
      correctIndex: q.correctIndex,
    }));
    writeLocalQuiz(topicId, toStore);

    if (pendingAction === 'half') {
      setFirstHalfStatus('quizzed');      // continue session
    } else if (pendingAction === 'onlySecond') {
      setSecondHalfStatus('quizzed');     // finished second half → close session
      closeSession();
    } else if (pendingAction === 'catchUpAll') {
      setFirstHalfStatus('quizzed');
      setSecondHalfStatus('quizzed');     // both done → close session
      closeSession();
    } else if (pendingAction === 'backlog') {
      clearBacklog();                      // quiz backlog done → clear
    }

    const chunk = pendingChunk;
    setPendingAction(null);
    setPendingChunk(null);
    router.push(`/quiz/local?topicId=${topicId}&chunk=${chunk}`);
  }, [sseStatus, sseData, pendingChunk, pendingAction, topicId, router]);

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
    startFullOnlySecond,
    startFullCatchUpAll,
    skipFullQuiz,

    // Backlog
    backlogCount,
    startBacklogQuiz,

    // API for Page
    ensureBaseline,
    onStudiedProgress,

    sessionEpoch,
  };
}
