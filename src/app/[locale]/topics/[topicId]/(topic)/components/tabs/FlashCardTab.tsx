import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import LoadingPage from '@/app/loading';
import FlashcardContent from '../flashcard/FlashcardContent';
import DataStatus from '@/components/errors/DataStatus';
import { isEmpty, isNil } from '@/utils';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { UserRoleEnum } from '@/utils/constants/roles';

export default function FlashCardTab() {
    const [learningMode] = useLocalStorage<ILearningMode>('learningMode', MODE_ACCESS_PAGE_ROLE.personal);
    const { isStudent, isTeacher } = useRoleChecker();
    const getRole = () => {
        if (isStudent) return UserRoleEnum.USER;
        if (isTeacher) return UserRoleEnum.TEACHER;
        return UserRoleEnum.ADMIN;
    };

    const { flashcards, learningFlashcards, ankiSettings, isFlashcardTabLoading, flashcardTabError } =
        useTopicWorkspace();

    if (isFlashcardTabLoading) return <LoadingPage />;

    if (flashcardTabError) return <DataStatus variant="error" title={flashcardTabError} />;

    if (isNil(learningFlashcards) || isNil(flashcards) || isNil(ankiSettings)) return <DataStatus variant="empty" />;

    return <FlashcardContent mode={learningMode as ILearningMode} role={getRole()} />;
}
