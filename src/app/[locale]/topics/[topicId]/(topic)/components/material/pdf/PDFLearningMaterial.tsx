import { useEffect, useRef, useState } from 'react';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { pdfjs } from 'react-pdf';
import CustomPDFViewer from './CustomPDFViewer';
import { safeDestructure } from '@/utils';
import SelectMenu from '../SelectMenu';
import usePdfReader from '@/hooks/usePdfReader';
import DataStatus from '@/components/errors/DataStatus';
import LoadingPage from '@/app/loading';

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
    const { contentTextOrigin, pdfPageTexts, setTotalPages } = useTopicWorkspace();

    const { blobUrl, file } = safeDestructure(data);

    const [pdfUrl, setPdfUrl] = useState<string>('');

    const { extractPdfToText, loading, error } = usePdfReader({
        onExtractFullSuccess(extractResult) {
            contentTextOrigin.current = extractResult.text;
            pdfPageTexts.current = extractResult.pageTexts;
            setTotalPages(extractResult.pages);
        },
    });

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
        extractPdfToText(data.file);
    }, [data.file]);

    const ref = useRef<HTMLDivElement>(null);

    if (error) {
        return <DataStatus variant="error" title="Error while processing PDF file." />;
    }
    if (loading) {
        return <LoadingPage />;
    }

    return (
        <div className="h-full flex flex-col gap-4">
            <CustomPDFViewer pdfUrl={pdfUrl} fileName={file?.name} ref={ref} />
            <SelectMenu refNode={ref} />
        </div>
    );
}
