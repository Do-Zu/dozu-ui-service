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
    questionText: q.questionText.trim(),
    choices: q.choices.map((choice) => choice.trim()),
  }));

  const insert = formatted
    .filter((q) => !q.serverInfo && q.questionText && q.choices.length > 0)
    .map<IQuestionAdded>((q) => ({
      questionText: q.questionText,
      choices: q.choices,
      correctIndex: q.correctIndex,
    }));

  const update = formatted
    .filter((q) => q.serverInfo?.isUpdated && !q.serverInfo.isDeleted)
    .map<IQuestionUpdated>((q) => ({
      id: q.serverInfo!.questionId, 
      questionText: q.questionText,
      choices: q.choices,
      correctIndex: q.correctIndex,
    }));

  const del = formatted
    .filter((q) => q.serverInfo?.isDeleted)
    .map<IQuestionDeleted>((q) => q.serverInfo!.questionId);

  if (insert.length === 0 && update.length === 0 && del.length === 0) return null;

  return {
    insert,
    update,
    delete: del,
  };
}
