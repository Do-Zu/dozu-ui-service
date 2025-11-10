import useFetch from '@/hooks/useFetch';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import learningMaterialService, { ILearningMaterial } from '../../service/learningMaterial.service';
import LoadingPage from '@/app/loading';
import PDFLearningMaterial from './pdf/PDFLearningMaterial';
import YoutubeLearningMaterial from './youtube/YoutubeLearningMaterial';

export default function LearningMaterial() {
    const { topicId } = useTopicWorkspace();

    const { data, loading, error } = useFetch<ILearningMaterial>(() =>
        learningMaterialService.getLearningMaterial({ topicId }),
    );

    if (error) return <>{error}</>;
    if (loading) return <LoadingPage />;
    if (!data) return <>Data not Found</>;

    switch (data.type) {
        case 'file':
            return <PDFLearningMaterial data={data} />;
        case 'youtube':
            return <YoutubeLearningMaterial videoId={data.videoId} content={data.content} />;
    }
}
