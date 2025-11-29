import { MindMapProvider } from '@/app/[locale]/mindmap/context/MindMapContext';
import MindmapContent from '../mindmap/MindmapContent';
import useFetch from '@/hooks/useFetch';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { isNil } from '@/utils';
import { METHOD_LEARNING } from '@/utils/constants/method';
import DataStatus from '@/components/errors/DataStatus';
import Spinner from '@/components/ui/spinner';
import { useEffect } from 'react';
import flashcardContentService, { IFlashcardContent } from '../../service/flashcardContent.service';
import { UserRoleEnum } from '@/utils/constants/roles';
import { useRoleChecker } from '@/hooks/useRoleChecker';

interface StudentProps {
    role: UserRoleEnum.USER;
}
interface TeacherProps {
    role?: UserRoleEnum.TEACHER;
}

type Props = StudentProps | TeacherProps;

export default function MindmapTab({}: Props) {
    const {
        tab,
        topicId,
        flashcards,
        setFlashcards,
        learningFlashcards,
        setLearningFlashcards,
        ankiSettings,
        setAnkiSettings,
    } = useTopicWorkspace();

    const {
        data: flashcardContent,
        loading: flashcardContentLoading,
        error: flashcardContentError,
    } = useFetch<IFlashcardContent>(() => flashcardContentService.getFlashcardContent({ topicId }), {
        shouldRun:
            (isNil(flashcards) || isNil(learningFlashcards) || isNil(ankiSettings)) && tab === METHOD_LEARNING.MINDMAP,
    });

    useEffect(() => {
        if (flashcardContent) {
            setFlashcards(flashcardContent.flashcards);
            setLearningFlashcards(flashcardContent.learningFlashcards);
            setAnkiSettings(flashcardContent.ankiSettings);
        }
    }, [flashcardContent]);

    const { isStudent } = useRoleChecker();
    const getRole = () => {
        if (isStudent) return UserRoleEnum.USER;
        return UserRoleEnum.TEACHER;
        // return UserRoleEnum.ADMIN;
    };

    if (flashcardContentLoading) return <Spinner />;

    if (flashcardContentError) return <DataStatus variant="error" title={flashcardContentError} />;

    if (isNil(learningFlashcards) || isNil(flashcards) || isNil(ankiSettings)) return <DataStatus variant="empty" />;

    return (
        <MindMapProvider>
            <MindmapContent role={getRole()} />
        </MindMapProvider>
    );
}
