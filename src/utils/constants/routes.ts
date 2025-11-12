import { ClassDashboardTab } from '@/app/[locale]/class-based/[id]/utils/class.constant';
import { ContentType } from '@/app/[locale]/generate/components/ContentGenerationPreview';

export const ROUTES = Object.freeze({
    LANDING: '/',
    HOME: '/home',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    WELCOME: '/welcome',
    ONBOARDING: '/onboarding',
    GENERATE: '/generate',
    FLASHCARD: '/flashcard',
    FLASHCARD_CREATE: '/flashcard/create',
    FLASHCARDS_EDIT: (topicId: string | number) => `/flashcards/edit/${topicId}`,
    FLASHCARDS_BROWSE: (topicId: string | number) => `/flashcards/browse/${topicId}`,
    FLASHCARDS_LEARNING: (topicId: string | number) => `/flashcards/learning/${topicId}`,
    QUIZ_DASBOARD: (topicId: string | number) => `/quiz/${topicId}/quiz-type`,
    SETTING_SCHEDULE_SETUP: '/setting/schedule-setup',
    UNAUTHORIZED: '/unauthorized',
    SCHEDULE: '/schedule',
    LIBRARY: '/library',
    PROGRESS: '/progress',
    PROFILE: '/setting/profile',
    PROFILE_EDIT: '/setting/profile/edit',
    PROFILE_AVATAR: '/setting/profile/avatar',
    PROFILE_PASSWORD: '/setting/profile/password',
    PROFILE_NOTIFICATIONS: '/setting/profile/notifications',
    PROFILE_PRIVACY: '/setting/profile/privacy',
    PROFILE_SETTINGS: '/setting/profile/settings',
    PAYMENT: (planId: string | number) => `/payment?planId=${planId}`,
    FEYNMAN_REVIEW: (topicId: string | number, method: string) => `/feynman/${topicId}?method=${method}`,
    ANKI_SETTINGS: (topicId: string | number) => `/topics/${topicId}/settings/anki`,
    TOPIC_WORKSPACE: ({ topicId, tab }: { topicId: number; tab?: ContentType | null }) =>
        `/topics/${topicId}?tab=${tab}`,

    // ======================= ADMIN ROUTES ========================

    ADMIN: '/admin',
    ADMIN_STATISTICS: '/admin/stats',

    // ======================= CLASS BASED ROUTES ========================
    CLASS_BASED: '/class-based',
    CLASS_BASED_ID: (classId: string | number) => `/class-based/${classId}`,
    CLASS_BASED_ID_GENERATE: (classId: string | number) => `/class-based/${classId}/generate`,
    CLASS_BASED_ID_STUDENTS: (classId: string | number) => `/class-based/${classId}/students`,
    ASSIGNMENT_DETAILS: ({ classId, assignmentId }: { classId: number; assignmentId: number }) =>
        `/class-based/${classId}/assignments/${assignmentId}/details`,
    CLASS_TOPIC_WORKSPACE: ({ classId, topicId }: { classId: number; topicId: number }) =>
        `/class-based/${classId}/topics/${topicId}`,

    MINDMAP_EDIT: (topicId: string | number) => `/mindmap/${topicId}`,
    MINDMAP_VIEW: (topicId: string | number) => `/mindmap/view/${topicId}`,
    CLASS_MINDMAP_VIEW: (classId: string | number, topicId: string | number) =>
        `/class-based/${classId}/mindmap/${topicId}`,

    QUIZ_START: (topicId: string | number) => `/quiz/${topicId}/quiz-type`,
    QUIZ_EDIT: (topicId: string | number) => `/question/edit/${topicId}`,

    // ======================= GAMES ========================
    FLASHCARDS_BRAIN_CHASE: (topicId: string | number) => `/games/brain-chase?topicId=${topicId}`,
    FLASHCARDS_MEMORY_MATCH: (topicId: string | number) => `/games/memory-match?topicId=${topicId}`,

    // ======================= TEACHER ROUTES ========================

    TEACHER: {
        HOME: '/teacher/home',
        CLASS_BASED: '/teacher/class-based',
        CLASS_BASED_ID: (classId: string | number, defaultTab?: ClassDashboardTab) =>
            `/teacher/class-based/${classId}${defaultTab ? `?defaultTab=${defaultTab}` : ''}`,
        CLASS_BASED_ID_GENERATE: (classId: string | number) => `/teacher/class-based/${classId}/generate`,
        CLASS_BASED_ID_STUDENTS: (classId: string | number) => `/teacher/class-based/${classId}/students`,
        CLASS_BASED_ID_MINDMAP_EDIT: (classId: string | number, topicId: string | number) =>
            `/teacher/class-based/${classId}/mindmap/${topicId}`,
        CLASS_BASED_ID_ASSIGNMENTS: (classId: string | number) => `/teacher/class-based/${classId}/assignments`,
        CLASS_BASED_ID_ASSIGNMENT_ID_EDIT: ({ classId, assignmentId }: { classId: number; assignmentId: number }) =>
            `/teacher/class-based/${classId}/assignments/${assignmentId}/edit`,
        CLASS_BASED_ID_ASSIGNMENT_ID_DETAILS: ({ classId, assignmentId }: { classId: number; assignmentId: number }) =>
            `/teacher/class-based/${classId}/assignments/${assignmentId}/details`,
        CLASS_BASED_ID_LEARNING_MATERIAL: (classId: string | number) =>
            `/teacher/class-based/${classId}/learning-material`,

        CLASS_TOPIC_WORKSPACE: ({ classId, topicId }: { classId: number; topicId: number }) =>
            `/teacher/class-based/${classId}/topics/${topicId}`,
    },
});

// Route groups for easier management
export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const;
export const GUEST_ROUTES = [ROUTES.WELCOME] as const;
export const PROTECTED_ROUTES = [
    ROUTES.GENERATE,
    ROUTES.SCHEDULE,
    ROUTES.FLASHCARD,
    ROUTES.FLASHCARD_CREATE,
    ROUTES.PROGRESS,
] as const;
export const ONBOARDING_ROUTES = [ROUTES.ONBOARDING] as const;

// Route access levels
export const ROUTE_ACCESS = {
    PUBLIC: 'public',
    GUEST_ONLY: 'guest_only',
    AUTHENTICATED: 'authenticated',
    NEW_USER: 'new_user',
    ONBOARDED: 'onboarded',
} as const;

// Route configuration with access levels
export const ROUTE_CONFIG = {
    [ROUTES.HOME]: ROUTE_ACCESS.PUBLIC,
    [ROUTES.LOGIN]: ROUTE_ACCESS.GUEST_ONLY,
    [ROUTES.REGISTER]: ROUTE_ACCESS.GUEST_ONLY,
    [ROUTES.WELCOME]: ROUTE_ACCESS.GUEST_ONLY,
    [ROUTES.ONBOARDING]: ROUTE_ACCESS.AUTHENTICATED,
    [ROUTES.GENERATE]: ROUTE_ACCESS.ONBOARDED,
    [ROUTES.FLASHCARD]: ROUTE_ACCESS.ONBOARDED,
    [ROUTES.FLASHCARD_CREATE]: ROUTE_ACCESS.ONBOARDED,
    [ROUTES.SCHEDULE]: ROUTE_ACCESS.ONBOARDED,
    [ROUTES.PROGRESS]: ROUTE_ACCESS.ONBOARDED,
    [ROUTES.UNAUTHORIZED]: ROUTE_ACCESS.PUBLIC,
    [ROUTES.PROFILE]: ROUTE_ACCESS.ONBOARDED,
} as const;
