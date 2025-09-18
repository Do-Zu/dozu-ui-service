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
