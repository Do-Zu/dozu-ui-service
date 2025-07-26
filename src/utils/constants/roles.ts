export const USER_ROLES = Object.freeze({
    ADMIN: 'admin',
    TEACHER: 'teacher',
    USER: 'user',
});

export type UserRole = keyof typeof USER_ROLES;
