const topicByIdEndpoint = (topicId: string | number) => `/topics/${topicId}`;
const topicFlashcardsEndpoint = (topicId: string | number) => `/topics/${topicId}/flashcards`;
const classTopicsEndpoint = (classId: string | number) => `/classes/${classId}/topics`;

export type ResourceId = string | number;

export const flashcardRoutes = (topicId: ResourceId) => ({
    TOPIC_FLASHCARDS: topicFlashcardsEndpoint,
    GET_FLASHCARDS_WITHOUT_TOPIC_INFO: `${topicFlashcardsEndpoint(topicId)}?includeTopic=false`,
    GET_FLASHCARDS_WITH_TOPIC_INFO: `${topicFlashcardsEndpoint(topicId)}?includeTopic=true`,
    GET_DUE_FLASHCARDS: `${topicFlashcardsEndpoint(topicId)}/learning`,
    BATCH_FLASHCARDS: `${topicFlashcardsEndpoint(topicId)}/batch`,
    BATCH_FLASHCARDS_FOR_NODE: `${topicFlashcardsEndpoint(topicId)}/batch/node`,
    REVIEW_FLASHCARD_WITH_QUALITY: ({ flashcardId }: { flashcardId: ResourceId }) =>
        `${topicFlashcardsEndpoint(topicId)}/${flashcardId}/review`,
});

export const API_TOPIC_ROUTES = Object.freeze({
    GET_TOPICS: '/topics',
    CREATE_TOPIC: '/topics',
    UPDATE_TOPIC: ({ topicId }: { topicId: ResourceId }) => `${topicByIdEndpoint(topicId)}`,
    DELETE_TOPIC: ({ topicId }: { topicId: ResourceId }) => `${topicByIdEndpoint(topicId)}`,
    CREATE_TOPIC_FOR_CLASS: ({ classId }: { classId: ResourceId }) => `/${classTopicsEndpoint(classId)}`,
    UPDATE_TOPIC_FOR_CLASS: ({ classId, topicId }: { classId: ResourceId; topicId: ResourceId }) =>
        `/${classTopicsEndpoint(classId)}/${topicId}`,
    DELETE_TOPIC_FOR_CLASS: ({ classId, topicId }: { classId: ResourceId; topicId: ResourceId }) =>
        `/${classTopicsEndpoint(classId)}/${topicId}`,
});
