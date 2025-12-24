import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { METHOD_LEARNING } from '@/utils/constants/method';
import { UserRole, UserRoleEnum } from '@/utils/constants/roles';

type TabPermission = {
    modes?: ILearningMode[];
    roles?: UserRole[];
};

export const TAB_PERMISSIONS: Record<string, TabPermission> = {
    overview: {
        modes: [MODE_ACCESS_PAGE_ROLE.personal, MODE_ACCESS_PAGE_ROLE.classBased],
        roles: [UserRoleEnum.USER, UserRoleEnum.TEACHER],
    },

    [METHOD_LEARNING.MINDMAP]: {
        modes: [MODE_ACCESS_PAGE_ROLE.personal, MODE_ACCESS_PAGE_ROLE.classBased],
        roles: [UserRoleEnum.USER, UserRoleEnum.TEACHER],
    },

    [METHOD_LEARNING.FLASHCARD]: {
        modes: [MODE_ACCESS_PAGE_ROLE.personal, MODE_ACCESS_PAGE_ROLE.classBased],
        roles: [UserRoleEnum.USER, UserRoleEnum.TEACHER],
    },

    [METHOD_LEARNING.QUIZ]: {
        modes: [MODE_ACCESS_PAGE_ROLE.personal, MODE_ACCESS_PAGE_ROLE.classBased],
        roles: [UserRoleEnum.USER, UserRoleEnum.TEACHER],
    },

    note: {
        modes: [MODE_ACCESS_PAGE_ROLE.personal],
        roles: [UserRoleEnum.USER],
    },
};
