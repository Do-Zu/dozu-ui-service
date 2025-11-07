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
        setPdfUrl(blobUrl);
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [blobUrl]);

    return <CustomPDFViewer pdfUrl={pdfUrl} />;
}
