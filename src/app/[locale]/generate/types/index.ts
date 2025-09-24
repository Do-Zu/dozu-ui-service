import { object } from 'zod';

export interface ApiResponsePubGenContent {
    status: string;
    message: string;
    data?: {
        jobId: string;
        status?: string;
        data?: object[];
    };
    sse: {
        event: string;
    };
}

export interface IGenerateFlashcardItem {
    q: string;
    a: string;
}

export type IFlashcardsFromSSE = IGenerateFlashcardItem[];

export interface IGenerateQuestionItemRaw {
  q: string;
  o: string[];
  idx: number;
}

export type IQuestionsFromSSERaw = IGenerateQuestionItemRaw[];

export interface ISseData {
    jobId: string;
    timestamp: string;
    status: string;
    data?: {
        data: object[];
        text: string;
        timestamp: string;
        type: string;
    };
}

export const CONTENT_TYPE_GENERATE = Object.freeze({
    FLASH_CARD: 'flashcard',
    QUIZ: 'quiz',
    MIND_MAP: 'mindmap',
    MULTIPLE_CHOICE: 'multiple_choice',
    SUMMARY: 'summary',
});
