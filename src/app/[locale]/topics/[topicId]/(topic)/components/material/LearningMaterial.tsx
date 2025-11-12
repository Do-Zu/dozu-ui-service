import { useEffect } from 'react';
import useFetch from '@/hooks/useFetch';
import learningMaterialService, { ILearningMaterial } from '../../service/learningMaterial.service';
import LoadingPage from '@/app/loading';
import PDFLearningMaterial from './PDFLearningMaterial';
import YoutubeLearningMaterial from './youtube/YoutubeLearningMaterial';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import DataStatus from '@/components/errors/DataStatus';

export default function LearningMaterial() {
    const { topicId, setLearningMaterial } = useTopicWorkspace();

    const { data, loading, error } = useFetch<ILearningMaterial>(() =>
        learningMaterialService.getLearningMaterial({ topicId }),
    );

    useEffect(() => {
        if (data && !error) {
            setLearningMaterial(data);
        }
    }, [data, error]);

    if (error) return <DataStatus variant="error" title={error} />;
    if (loading) return <LoadingPage />;
    if (!data) return <DataStatus variant="empty" />;

    switch (data.type) {
        case 'file':
            return <PDFLearningMaterial data={data} />;
        case 'youtube':
            return <YoutubeLearningMaterial videoId={data.videoId} embedUrl={data.embedUrl} content={data.content} />;
    }
}
