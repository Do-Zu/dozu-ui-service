import { IQuestion, IQuestionBasic } from '../../question/types/question.type';
import { IQuestionsFromSSERaw, IGenerateQuestionItemRaw } from '../../generate/types';

const initialQuestionsCount = 3;

function createInitialQuestion(id: number): IQuestion {
    return {
        id,
        questionText: '',
        choices: ['', '', '', ''],
        correctIndex: 0,
    };
}

function isEmptyArray(array: any): boolean {
    return Array.isArray(array) && array.length === 0;
}

export function handleConvertToQuestionsEdited(
    prop:
        | {
              type: 'manual';
              questionsProp: {
                  questions: IQuestionBasic[];
                  topicName: string;
              };
          }
        | {
              type: 'generative';
              questionsProp: IQuestionsFromSSERaw;
          },
): IQuestion[] {
    const { type, questionsProp } = prop;
    let initialQuestions: IQuestion[];

    if (type === 'manual') {
        const { questions } = questionsProp;

        if (isEmptyArray(questions)) {
            initialQuestions = Array.from({ length: initialQuestionsCount }, (_, i) => createInitialQuestion(i));
        } else {
            initialQuestions = questions.map((q, index) => ({
                id: q.questionId,
                questionText: q.questionText,
                choices: q.choices,
                correctIndex: q.correctIndex,
                serverInfo: {
                    questionId: q.questionId,
                    topicId: q.topicId,
                    isUpdated: false,
                    isDeleted: false,
                },
            }));

            for (let i = initialQuestions.length; i % 3 !== 0; ++i) {
                initialQuestions.push(createInitialQuestion(initialQuestions.length + i));
            }
        }
    } else {
        initialQuestions = (questionsProp ?? []).map((q: IGenerateQuestionItemRaw, index: number) => ({
            id: index,
            questionText: q?.q,
            choices: q?.o,
            correctIndex: q?.idx,
            questionType: q?.type,
            hint: q?.hint,
            explain: q?.explain,
        }));

        for (let i = initialQuestions.length; i % 3 !== 0; ++i) {
            initialQuestions.push(createInitialQuestion(initialQuestions.length + i));
        }
    }

    return initialQuestions;
}
