import { PdfPageText } from '@/hooks/usePdfReader';
import { useRef, useState } from 'react';

export default function usePdfMaterial() {
    const pdfPageTexts = useRef<PdfPageText[] | null>(null);
    const [totalPages, setTotalPages] = useState<number | null>(null);

    const [isPdfViewerFullscreen, setIsPdfViewerFullscreen] = useState<boolean>(false);
    const [pageNumber, setPageNumber] = useState<number>(1);

    return {
        pdfPageTexts,
        totalPages,
        setTotalPages,
        pageNumber,
        setPageNumber,
        isPdfViewerFullscreen,
        setIsPdfViewerFullscreen,
    };
}
