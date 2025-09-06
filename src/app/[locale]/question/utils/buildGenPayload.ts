import { IFlashcardWithServer } from '@/app/[locale]/flashcards/components/FlashcardEditor';
import { IQuestion } from '@/app/[locale]/question/types/question.type';
import type { IFlashcardWithReviewPrediction } from '@/app/[locale]/flashcards/learning/[topicId]/page';

export const buildContentFromFlashcardsForQuiz = (
  topicId: string | number,
  flashcards: IFlashcardWithServer[]
): string => {
  const items = (flashcards ?? [])
    .filter(c => !c.serverInfo?.isDeleted)
    .map(({ front, back }) => ({ q: (front ?? '').trim(), a: (back ?? '').trim() }))
    .filter(x => x.q && x.a);

  return JSON.stringify({
    source: 'FLASH_CARD',
    topicId,
    flashcards: items, // [{ q, a }]
  });
};

export const buildContentFromQuestionsForFlashcards = (
  topicId: string | number,
  questions: IQuestion[]
): string => {
  const items = (questions ?? [])
    .filter(q => !(q as any).serverInfo?.isDeleted)
    .map(q => ({
      questionText: (q.questionText ?? '').trim(),
      choices: (q.choices ?? []).map(c => (c ?? '').trim()),
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
    }))
    .filter(x => x.questionText && x.choices?.length > 0);

  return JSON.stringify({
    source: 'QUIZ',
    topicId,
    questions: items, // [{ questionText, choices, correctIndex }]
  });
};

export const buildPayloadFromLearnedFlashcards = (topicId: string | number, cards: IFlashcardWithReviewPrediction[]) => {
  const items = cards
    .map(c => ({ q: (c.front ?? '').trim(), a: (c.back ?? '').trim() }))
    .filter(x => x.q && x.a);

  return JSON.stringify({
    source: 'FLASH_CARD',
    topicId,
    flashcards: items, // [{ q, a }]
  });
}
