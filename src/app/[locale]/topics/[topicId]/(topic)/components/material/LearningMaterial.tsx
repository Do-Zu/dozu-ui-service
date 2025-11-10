import useFetch from '@/hooks/useFetch';
import learningMaterialService, { ILearningMaterial } from '../../service/learningMaterial.service';
import LoadingPage from '@/app/loading';
import { pdfjs } from 'react-pdf';
import PDFLearningMaterial from './pdf/PDFLearningMaterial';
import YoutubeLearningMaterial from './youtube/YoutubeLearningMaterial';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
    topicId: number;
}

export default function LearningMaterial({ topicId }: Props) {
    const { data, loading, error } = useFetch<ILearningMaterial>(() =>
        learningMaterialService.getLearningMaterial({ topicId }),
    );

    if (error) return <>{error}</>;
    if (loading) return <LoadingPage />;
    if (!data) return <>Data not Found</>;

    switch (data.type) {
        case 'file':
            return <PDFLearningMaterial blobUrl={data.blobUrl} fileName={data.file.name} />;
        case 'youtube':
            return <YoutubeLearningMaterial videoId={data.videoId} content={data.content} />;
    }
}
