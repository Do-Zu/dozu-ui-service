export const METHOD_LEARNING = {
    FLASHCARD: 'flashcard',
    QUIZ: 'quiz',
    FEYNMAN: 'feynman',
    GAMIFICATION: 'gamification',
    MINDMAP: 'mindmap',
} as const;

export type TypeMethodLearning = (typeof METHOD_LEARNING)[keyof typeof METHOD_LEARNING];
