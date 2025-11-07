import { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import CustomPDFViewer from './CustomPDFViewer';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
    blobUrl: string;
}

export default function PDFLearningMaterial({ blobUrl }: Props) {
    const [pdfUrl, setPdfUrl] = useState<string>('');

    useEffect(() => {
        const prevUrl = blobUrl;
        setPdfUrl(prevUrl);

        return () => {
            if (prevUrl) {
                URL.revokeObjectURL(prevUrl);
            }
        };
    }, [blobUrl]);

    return <CustomPDFViewer pdfUrl={pdfUrl} />;
}
