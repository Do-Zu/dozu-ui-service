import useFetch from '@/hooks/useFetch';
import learningMaterialService, { ILearningMaterial } from '../../service/learningMaterial.service';
import LoadingPage from '@/app/loading';
import { pdfjs } from 'react-pdf';
import PDFLearningMaterial from './PDFLearningMaterial';
import YoutubeLearningMaterial from './YoutubeLearningMaterial';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import useReaderFile from '@/hooks/useReaderFile';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
            return <YoutubeLearningMaterial embedUrl={data.embedUrl} content={data.content} />;
    }
}
