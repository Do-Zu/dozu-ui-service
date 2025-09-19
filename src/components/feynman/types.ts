export interface FeynmanPracticePageProps {
    topicId: string;
    initialContent: string | string[];
    maxLengthExplain?: number;
    highlightConfig: {
        minWordLength: number;
    };
}

export type FeynmanAIRequest = {
    topicId: string;
    explanation: string;
    highlightedWords: string[];
    method: 'feynman';
    origin_content: string;
};

export type FeynmanAIResponse = {
    questions: string[];
    hints: string[];
    feedBack?: string;
    detectedGaps?: { word: string; suggestion: string }[];
    clarityScore?: number; // 0..100 optional mock
};

export interface IFeynmanDetectedGap {
    word: string;
    suggestion: string;
}

export interface IFeynmanResponseQuestion {
    questions: { content: string }[];
    hints: string[];
    detectedGaps: IFeynmanDetectedGap[];
}

export interface IFeynmanEvaluationScores {
    overall: number;
    clarity: number;
    correctness: number;
    simplicity: number;
    structure: number;
    analogyUse: number;
}

export interface IFeynmanFeedback {
    summary: string;
    strengths: string[];
    improvements: string[];
}

export interface IFeynmanQuestion {
    content: string;
}

export interface IFeynmanDetectedGap {
    word: string;
    suggestion: string;
}

export interface IFeynmanGlossaryEntry {
    term: string;
    simpleDefinition: string;
}

export interface IFeynmanReviewedResponse {
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
