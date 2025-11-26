import {
    IQuestion,
    IQuestionAdded,
    IQuestionUpdated,
    IQuestionDeleted,
    IQuestionsBatchSubmitted,
} from '../../question/types/question.type';

export function handleConvertToQuestionsSubmitted(questions: IQuestion[]): IQuestionsBatchSubmitted | null {
    if (!questions) return null;

    const formatted = questions.map((q) => ({
        ...q,
        questionText: (q.questionText ?? '').trim(),
        choices: Array.isArray(q.choices) ? q.choices.map((c) => (c ?? '').trim()) : [],
        questionType: q.questionType ?? null,
    }));

    const valid = formatted.filter((q) => {
        const hasText = q.questionText.length > 0;
        const hasAnyChoice = Array.isArray(q.choices) && q.choices.some((c) => c && c.length > 0);

        return hasText && hasAnyChoice;
    });

    //insert
    const insert = valid
        .filter((q) => !q.serverInfo)
        .map<IQuestionAdded>((q) => ({
            questionText: q.questionText,
            choices: q.choices,
            correctIndex: q.correctIndex,
            questionType: q.questionType,
            hint: q.hint,
            explain: q.explain,
        }));

    //update
    const update = valid
        .filter((q) => q.serverInfo?.isUpdated && !q.serverInfo.isDeleted)
        .map<IQuestionUpdated>((q) => ({
            id: q.serverInfo!.questionId,
            questionText: q.questionText,
            choices: q.choices,
            correctIndex: q.correctIndex,
            questionType: q.questionType,
        }));

    //delete
    const del = formatted.filter((q) => q.serverInfo?.isDeleted).map<IQuestionDeleted>((q) => q.serverInfo!.questionId);

    if (insert.length === 0 && update.length === 0 && del.length === 0) return null;

    return {
        insert,
        update,
        delete: del,
    };
}
