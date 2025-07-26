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

    // ======================= ADMIN ROUTES ========================

    ADMIN: '/admin',
    ADMIN_STATISTICS: '/admin/stats',

    // ======================= CLASS BASED ROUTES ========================
    CLASS_BASED: '/class-based',
    CLASS_BASED_ID: (classId: string | number) => `/class-based/${classId}`,
    CLASS_BASED_ID_GENERATE: (classId: string | number) => `/class-based/${classId}/generate`,
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
