export interface IQuestionAdded {
    questionText: string;
    choices: string[];
    correctIndex: number;
    questionType: string | null;
    hint?: string;
    explain?: string;
}

export interface IQuestionUpdated {
    id: number;
    questionText: string;
    choices: string[];
    correctIndex: number;
}

export type IQuestionDeleted = number;

export interface IQuestionBasic {
    questionId: number;
    topicId: number;
    questionText: string;
    choices: string[];
    correctIndex: number;
}

export interface IQuestionServerInfo {
    questionId: number;
    topicId: number;
    isUpdated: boolean;
    isDeleted: boolean;
}

export interface IQuestion {
    id: number;
    questionText: string;
    choices: string[];
    correctIndex: number;
    serverInfo?: IQuestionServerInfo;
    questionType?: string;
    hint?: string;
    explain?: string;
}

export interface IQuestionsBatchSubmitted {
    insert?: IQuestionAdded[];
    update?: IQuestionUpdated[];
    delete?: IQuestionDeleted[];
}

export interface IGeneratedQuizItem {
    q: string;
    o: string[];
    idx: number;
    type: string;
    hint: string;
    explain: string;
}
