export type LocalQuizQuestion = {
  questionText: string;
  choices: string[];
  correctIndex: number;
};

const keyForTopic = (topicId: string | number) => `localQuiz:${topicId}`;

export function writeLocalQuiz(topicId: string | number, questions: LocalQuizQuestion[]) {
  localStorage.setItem(keyForTopic(topicId), JSON.stringify(questions));
}

export function readLocalQuiz(topicId: string | number): LocalQuizQuestion[] | null {
  const raw = typeof window !== 'undefined' ? localStorage.getItem(keyForTopic(topicId)) : null;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalQuizQuestion[];
  } catch {
    return null;
  }
}

export function clearLocalQuiz(topicId: string | number) {
  localStorage.removeItem(keyForTopic(topicId));
}
