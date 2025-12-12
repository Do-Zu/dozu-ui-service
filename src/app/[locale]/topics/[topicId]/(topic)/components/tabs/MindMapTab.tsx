import { MindMapProvider } from '@/app/[locale]/mindmap/context/MindMapContext';
import MindmapContent from '../mindmap/MindmapContent';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { isNil } from '@/utils';
import DataStatus from '@/components/errors/DataStatus';
import { UserRoleEnum } from '@/utils/constants/roles';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import LoadingPage from '@/app/loading';

interface StudentProps {
    role: UserRoleEnum.USER;
}
interface TeacherProps {
    role?: UserRoleEnum.TEACHER;
}

type Props = StudentProps | TeacherProps;

export default function MindmapTab({}: Props) {
    const { flashcards, learningFlashcards, ankiSettings, isFlashcardTabLoading, flashcardTabError } =
        useTopicWorkspace();

    const [learningMode] = useLocalStorage<ILearningMode>('learningMode', MODE_ACCESS_PAGE_ROLE.personal);
    const { isStudent } = useRoleChecker();
    const getRole = () => {
        if (isStudent) return UserRoleEnum.USER;
        return UserRoleEnum.TEACHER;
        // return UserRoleEnum.ADMIN;
    };

    if (isFlashcardTabLoading) return <LoadingPage />;

    if (flashcardTabError) return <DataStatus variant="error" title={flashcardTabError} />;

    if (isNil(learningFlashcards) || isNil(flashcards) || isNil(ankiSettings)) return <DataStatus variant="empty" />;

    return (
        <MindMapProvider>
            <MindmapContent mode={learningMode as ILearningMode} role={getRole()} />
        </MindMapProvider>
    );
}
