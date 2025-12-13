import { useEffect, useRef, useState } from 'react';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { pdfjs } from 'react-pdf';
import CustomPDFViewer from './CustomPDFViewer';
import { isNilOrEmpty, safeDestructure } from '@/utils';
import useReaderFile from '@/hooks/useReaderFile';
import SelectMenu from '../SelectMenu';

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
    const { contentTextOrigin } = useTopicWorkspace();

    const { blobUrl, file } = safeDestructure(data);

    const [pdfUrl, setPdfUrl] = useState<string>('');

    const { text, isProcessing } = useReaderFile(file);

    useEffect(() => {
        const prevUrl = blobUrl;
        setPdfUrl(prevUrl);

        return () => {
            if (prevUrl) {
                URL.revokeObjectURL(prevUrl);
            }
        };
    }, [blobUrl]);

    useEffect(() => {
        if (!isNilOrEmpty(text) && !isProcessing) {
            contentTextOrigin.current = text!;
        }
    }, [text, isProcessing]);

    const ref = useRef<HTMLDivElement>(null);

    return (
        <div className="h-full flex flex-col gap-4">
            <CustomPDFViewer pdfUrl={pdfUrl} fileName={file?.name} ref={ref} />
            <SelectMenu refNode={ref} />
        </div>
    );
}
