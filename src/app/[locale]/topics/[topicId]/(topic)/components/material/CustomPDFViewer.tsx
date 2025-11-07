'use client';

import { Button } from '@/components/ui/button';
import toastHelper from '@/utils/toast.helper';
import { Maximize, Minimize } from 'lucide-react';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
    pdfUrl: string;
}

const CustomPDFViewer = ({ pdfUrl }: Props) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const documentRef = useRef<HTMLDivElement>(null);
    const [documentSize, setDocumentSize] = useState<{ width: number; height: number }>();
    const [documentScale, setDocumentScale] = useState<number>(1);

    const [pdfSize, setPdfSize] = useState<{ width: number; height: number }>();

    const [isFullscreen, setIsFullscreen] = useState(false);

    // need to be verified
    useEffect(() => {
        if (!documentRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDocumentSize({ width, height });
            }
        });

        observer.observe(documentRef.current);

        return () => observer.disconnect();
    }, []);

    // need to be used with debounce
    useEffect(() => {
        if (documentSize && pdfSize) {
            setDocumentScale(documentSize.width / pdfSize.width);
        }
    }, [documentSize?.width, documentSize?.height, pdfSize?.width, pdfSize?.height]);

    async function onDocumentLoadSuccess(pdfObject: PDFDocumentProxy) {
        const { numPages } = pdfObject;
        setNumPages(numPages);
        setPageNumber(1);
        if (numPages >= 1) {
            const page = await pdfObject.getPage(1);
            const { width, height } = page.getViewport({ scale: 1 });
            setPdfSize({ width, height });
        }
    }

    function onDocumentLoadError() {
        toastHelper.showErrorMessage('Cannot load your PDF file, please try again.');
    }

    function handleScreenModeToogle() {
        setIsFullscreen((prev) => !prev);
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="px-2">
                <Button variant="ghost" size="icon" onClick={handleScreenModeToogle}>
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    <span className="sr-only">Toggle Fullscreen</span>
                </Button>
            </div>
            <div className="overflow-y-auto max-h-[80vh] border rounded-md p-2">
                <Document
                    file={pdfUrl}
                    onLoadError={onDocumentLoadError}
                    onLoadSuccess={onDocumentLoadSuccess}
                    inputRef={documentRef}
                >
                    {Array.from({ length: numPages || 0 }, (_, index) => {
                        const pageNumber = index + 1;
                        return (
                            <Page
                                key={`page_${pageNumber}`}
                                pageNumber={pageNumber}
                                scale={documentScale}
                                rotate={0}
                            ></Page>
                        );
                    })}
                </Document>
            </div>
            <p>
                Page {pageNumber} of {numPages}
            </p>
        </div>
    );
};

export default CustomPDFViewer;
