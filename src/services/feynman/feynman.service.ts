import { getRequest, postRequest } from '@/api/api';

export interface IFeynmanSessionRequest {
    topicId: number;
    method: string;
    explanationText: string;
    explanationHtml: string;
    highlightedWords: string[];
    questions: IFeynmanSessionQuestions;
    review?: IFeynmanSessionReviewState;
    step: number;
    version?: number;
    savedAt: string;
}

export interface IFeynmanSessionReviewState {
    scores: IFeynmanEvaluationScores;
    feedback: IFeynmanFeedback;
    improvedExplanation: string;
    stepByStep: string[];
    hints: string[];
    questions: IFeynmanQuestion[];
    detectedGaps: IFeynmanDetectedGap[];
    glossary: IFeynmanGlossaryEntry[];
    actionPlan: string[];
}

export interface IFeynmanDetectedGap {
    word: string;
    suggestion: string;
}

export interface IFeynmanQuestion {
    content: string;
}

export interface IFeynmanFeedback {
    summary: string;
    strengths: string[];
    improvements: string[];
}

export interface IFeynmanEvaluationScores {
    overall: number;
    clarity: number;
    correctness: number;
    simplicity: number;
    structure: number;
    analogyUse: number;
}

export interface IFeynmanGlossaryEntry {
    term: string;
    simpleDefinition: string;
}

export interface IFeynmanSessionQuestions {
    questions: { content: string }[];
    hints: string[];
    detectedGaps: IFeynmanDetectedGap[];
    clarityScore?: number;
    feedback?: string;
}

export interface IFeynmanSessionReviewState {
    scores: IFeynmanEvaluationScores;
    feedback: IFeynmanFeedback;
    improvedExplanation: string;
    stepByStep: string[];
    hints: string[];
    questions: IFeynmanQuestion[];
    detectedGaps: IFeynmanDetectedGap[];
    glossary: IFeynmanGlossaryEntry[];
    actionPlan: string[];
}

export interface IUpdateReview {
    review: IFeynmanSessionReviewState;
    topicId: number;
    method: string;
}

export interface IGetSession {
    topicId: number;
    method: string;
    limit?: number;
}

export interface IFeynmanSession {
    topicId: number;
    method: string;
    id: number;
    createdAt: Date;
    updatedAt: Date;
    explanationText: string;
    explanationHtml: string;
    highlightedWords: string[];
    questions: IFeynmanSessionQuestions;
    review: IFeynmanSessionReviewState | null;
    step: number;
    version: number | null;
    savedAt: Date;
}

export type FeynmanSessionUpdate = Pick<IFeynmanSessionRequest, 'topicId' | 'method'> &
    Partial<Omit<IFeynmanSessionRequest, 'topicId' | 'method'>>;

export interface IGetSession {
    topicId: number;
    method: string;
    limit?: number;
}

const BASE_URL = 'feynman';

export class FeynmanService {
    /**
     * storage sessions
     */
    async storageQuestions(request: IFeynmanSessionRequest): Promise<IFeynmanSessionRequest> {
        const response = await postRequest<IFeynmanSessionRequest, IFeynmanSessionRequest>(
            `${BASE_URL}/session`,
            request,
        );
        return response.data;
    }

    /**
     * get session
     */
    async getSessionFeynman(request: IGetSession): Promise<IFeynmanSession> {
        const response = await postRequest<IGetSession, IFeynmanSession>(`${BASE_URL}/session/retrieval`, request);
        return response.data;
    }

    /**
     * storage sessions
     */
    async updateSession(request: FeynmanSessionUpdate) {
        const response = await postRequest<FeynmanSessionUpdate, unknown>(`${BASE_URL}/modify`, request);
        return response.data;
    }
}

export const feynmanService = new FeynmanService();
