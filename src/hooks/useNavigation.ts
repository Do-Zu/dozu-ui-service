import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { useLocalStorage } from './useLocalStorage';
import { useRoleChecker } from './useRoleChecker';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { ROUTES } from '@/utils/constants/routes';
import { useRouter } from 'next/navigation';
import { ContentType } from '@/app/[locale]/generate/components/ContentGenerationPreview';

export default function useNavigation() {
    const router = useRouter();
    const { isStudent, isTeacher } = useRoleChecker();
    const [learningMode] = useLocalStorage<ILearningMode>('learningMode', MODE_ACCESS_PAGE_ROLE.personal);

    function navigateToTopicPage({ topicId, classId, tab }: { topicId: number; classId?: number; tab?: ContentType }) {
        if (learningMode === MODE_ACCESS_PAGE_ROLE.personal) {
            router.push(ROUTES.TOPIC_WORKSPACE({ topicId, tab }));
        } else if (isStudent || isTeacher) {
            if (!classId) return;
            router.push(ROUTES.TEACHER.CLASS_TOPIC_WORKSPACE({ classId, topicId }));
        }
    }

    return { navigateToTopicPage };
}
