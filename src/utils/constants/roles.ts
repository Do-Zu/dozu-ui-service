export const USER_ROLES = Object.freeze({
    ADMIN: 'admin',
    TEACHER: 'teacher',
    USER: 'user',
});

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export enum UserRoleEnum {
    ADMIN = 'admin',
    USER = 'user',
    TEACHER = 'teacher',
}
