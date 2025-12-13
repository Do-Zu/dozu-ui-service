const topicByIdEndpoint = (topicId: string | number) => `/topics/${topicId}`;
const topicFlashcardsEndpoint = (topicId: string | number) => `/topics/${topicId}/flashcards`;
const classTopicsEndpoint = (classId: string | number) => `/classes/${classId}/topics`;

export type ResourceId = string | number;

export const flashcardRoutes = (topicId: ResourceId) => ({
    TOPIC_FLASHCARDS: topicFlashcardsEndpoint,
    GET_FLASHCARDS_WITHOUT_TOPIC_INFO: `${topicFlashcardsEndpoint(topicId)}?includeTopic=false`,
    GET_FLASHCARDS_WITH_TOPIC_INFO: `${topicFlashcardsEndpoint(topicId)}?includeTopic=true`,
    GET_DUE_FLASHCARDS: `${topicFlashcardsEndpoint(topicId)}/learning`,
    BATCH_FLASHCARDS: `${topicFlashcardsEndpoint(topicId)}/batch/changes`,
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

// Gamification Routes
export const API_GAMIFICATION_ROUTES = Object.freeze({
    // Streak Routes
    // DEPRECATED: GET_USER_STREAK removed - use GET_USER_GAMIFICATION_STATS instead
    UPDATE_STREAK: '/gamification/streak/update',
    GET_STREAK_STATS: '/gamification/streak/stats',
    GET_STUDENT_STREAKS: ({ classId }: { classId: ResourceId }) => `/gamification/streak/students/${classId}`,
    BUY_STREAK_FREEZE: '/gamification/streak/buy-freeze',
    GIFT_STREAK_FREEZE: '/gamification/streak/gift-freeze',
    
    // Points Routes
    GET_USER_POINTS: '/gamification/points',
    GET_POINTS_HISTORY: '/gamification/points/history',
    GET_USER_GAMIFICATION_STATS: ({ userId }: { userId: ResourceId }) => `/gamification/points/user/${userId}`,
    SPEND_POINTS: '/gamification/points/spend',
    AWARD_QUIZ_POINTS: '/gamification/points/award/quiz',
    AWARD_FLASHCARD_POINTS: '/gamification/points/award/flashcard',
    AWARD_DAILY_GOAL_POINTS: '/gamification/points/award/daily-goal',
});
