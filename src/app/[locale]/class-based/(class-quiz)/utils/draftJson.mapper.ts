import { IDraftJson } from "../types/classQuiz.type";
import { IQuestion } from "@/app/[locale]/question/types/question.type";

/** FE editor -> DraftJson (tuân thủ items: { adHoc?, text, choices, correctIndex }) */
export function toDraftJsonFromQuestions(questions: IQuestion[], seed?: string, meta?: Record<string,unknown>): IDraftJson {
  return {
    orderSeed: seed,
    items: questions
      .filter(q => !q.serverInfo?.isDeleted)
      .map(q => ({
        adHoc: true, // explicit cho BE, dù là optional trong type FE
        text: q.questionText,
        choices: q.choices,
        correctIndex: q.correctIndex,
      })),
    meta,
  };
}

/** DraftJson -> FE editor questions (dùng khi load lại draft) */
export function toQuestionsFromDraftJson(draft: IDraftJson): IQuestion[] {
  const items = Array.isArray(draft.items) ? draft.items : [];
  return items.map((it, idx) => ({
    id: idx,
    questionText: it?.text ?? "",
    choices: Array.isArray(it?.choices) ? it!.choices : ["", "", "", ""],
    correctIndex: typeof it?.correctIndex === "number" ? it!.correctIndex : 0,
  }));
}
