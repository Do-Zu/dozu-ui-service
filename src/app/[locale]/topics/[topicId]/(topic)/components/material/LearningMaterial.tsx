import { useEffect, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import learningMaterialService, { ILearningMaterial } from '../../service/learningMaterial.service';
import LoadingPage from '@/app/loading';
import PDFLearningMaterial from './pdf/PDFLearningMaterial';
import YoutubeLearningMaterial from './youtube/YoutubeLearningMaterial';
import DataStatus from '@/components/errors/DataStatus';
import { AxiosError, HttpStatusCode } from 'axios';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import AudioLearningMaterial from './media/AudioLearningMaterial';

export default function LearningMaterial() {
    const [learningMode] = useLocalStorage<ILearningMode>('learningMode', MODE_ACCESS_PAGE_ROLE.personal);
    const { isStudent, isTeacher } = useRoleChecker();
    const router = useRouter();
    const { topicId, setLearningMaterial } = useTopicWorkspace();
    const [isNotFound, setIsNotFound] = useState<boolean>(false);

    const { data, loading, error } = useFetch<ILearningMaterial | null>(
        () => learningMaterialService.getLearningMaterial({ topicId }),
        {
            onError(...args) {
                const firstError = args[0];
                if (
                    firstError instanceof AxiosError &&
                    (firstError.status === HttpStatusCode.NotFound ||
                        firstError.response?.status === HttpStatusCode.NotFound)
                ) {
                    setIsNotFound(true);
                }
            },
        },
    );

    useEffect(() => {
        if (data && !error) {
            setLearningMaterial(data);
        }
    }, [data, error]);

    if (!loading && error) {
        if (isNotFound) {
            if (learningMode === MODE_ACCESS_PAGE_ROLE.personal || isTeacher) {
                return (
                    <DataStatus
                        variant="empty"
                        title="This topic does not have any document. Create a new topic with topic generation feature."
                        action={{
                            label: 'Generate',
                            onClick() {
                                router.push(ROUTES.GENERATE);
                            },
                        }}
                    />
                );
            }
            return <DataStatus variant="empty" title="This topic does not have any document." />;
        }
        return <DataStatus variant="error" title={error} />;
    }
    if (loading) return <LoadingPage />;
    if (!data) return <DataStatus variant="empty" />;

    switch (data.type) {
        case 'file':
            return <PDFLearningMaterial data={data} />;
        case 'youtube':
            return <YoutubeLearningMaterial videoId={data.videoId} content={data.content} />;
        case 'media':
            return <AudioLearningMaterial data={data} />;
        default:
            return <DataStatus variant="empty" title="This type of document is not supported yet." />;
    }
}
