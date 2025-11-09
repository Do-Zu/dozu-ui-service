import { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import CustomPDFViewer from './CustomPDFViewer';
import { isNullOrEmpty, safeDestructure } from '@/utils';
import useReaderFile from '@/hooks/useReaderFile';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface IData {
    blobUrl: string;
    type: string;
    file: File;
}
interface IProps {
    data: IData;
}

export default function PDFLearningMaterial({ data }: IProps) {
    const { setContentTextOrigin } = useTopicWorkspace();

    const { blobUrl, file } = safeDestructure(data);

    const [pdfUrl, setPdfUrl] = useState<string>('');

    const { text, isProcessing } = useReaderFile(file);

    useEffect(() => {
        if (!isNullOrEmpty(text)) {
            setContentTextOrigin(text!);
        }
    }, [text]);

    useEffect(() => {
        const prevUrl = blobUrl;
        setPdfUrl(prevUrl);

        return () => {
            if (prevUrl) {
                URL.revokeObjectURL(prevUrl);
            }
        };
    }, [blobUrl]);

    return <CustomPDFViewer pdfUrl={pdfUrl} fileName={file?.name} />;
}
