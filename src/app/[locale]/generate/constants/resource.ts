export const RESOURCE_CONTENT_TYPE = {
    FILE: 'file',
    YOUTUBE: 'youtube',
    WEBSITE: 'website',
    TEXT: 'text',
} as const;

export type ResourceContentType = (typeof RESOURCE_CONTENT_TYPE)[keyof typeof RESOURCE_CONTENT_TYPE];

export const IMPORT_METHOD = {
    FILE: 'file',
    TEXT: 'text',
    MEDIA: 'media',
} as const;

export type ImportMethod = (typeof IMPORT_METHOD)[keyof typeof IMPORT_METHOD];

export const EXTRACTION_TAB = {
    URL: 'url',
    TEXT: 'text',
    FILE: 'file',
} as const;

export type ExtractionTab = (typeof EXTRACTION_TAB)[keyof typeof EXTRACTION_TAB];

export const METHOD_LEARNING = {
    FLASHCARD: 'flashcards',
    QUIZ: 'quiz',
    MINDMAP: 'mindmap',
};

export const LIST_METHOD_LEARNING_GENERATE = Object.values(METHOD_LEARNING);

export const DEFAULT_METHOD_SELECT = METHOD_LEARNING.FLASHCARD;
