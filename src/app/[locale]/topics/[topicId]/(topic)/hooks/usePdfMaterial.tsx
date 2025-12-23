import { PdfPageText } from '@/hooks/usePdfReader';
import { useRef, useState } from 'react';

export default function usePdfMaterial() {
    const pdfPageTexts = useRef<PdfPageText[]>([]);
    const [totalPages, setTotalPages] = useState<number | null>(null);

    const [isPdfViewerFullscreen, setIsPdfViewerFullscreen] = useState<boolean>(false);
    const [pageNumber, setPageNumber] = useState<number>(1);

    function onPageNumberChange(page: number) {
        if (page === 1) {
            setPageNumber(page);
            return;
        }
        if (!totalPages || page > totalPages) return;
        setPageNumber(page);
    }

    return {
        pdfPageTexts,
        totalPages,
        setTotalPages,
        pageNumber,
        setPageNumber: onPageNumberChange,
        isPdfViewerFullscreen,
        setIsPdfViewerFullscreen,
    };
}
