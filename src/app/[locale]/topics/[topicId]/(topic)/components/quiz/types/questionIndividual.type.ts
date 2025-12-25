export type QuizConfidence = 1 | 2 | 3;

interface IQuestionIndividual {
    questionId: number;
    topicId: number;
    questionText: string;
    choices: string[];
    correctIndex: number;
    questionType: string;
    explain: string;
    hint: string;
    createdAt: string;
    quizId: number;
    selectedAnswer: string | null; // null when unanswered
    score?: number;
    maxScore?: number;
    isShowExplain: boolean;
    isCorrect: boolean;
    confidence?: QuizConfidence;
}


interface ICompareAnswerResponse {
    similarityAnswer: number;
    score: number;
    maxScore: number;
    isCorrect: boolean;
}
interface ICompareAnswerRequest {
    query: string;
    pattern: string;
    question: string;
    topicId: number;
    method: string;
    questionType: string;
    type?: string;
}

export type { IQuestionIndividual, ICompareAnswerRequest, ICompareAnswerResponse };
