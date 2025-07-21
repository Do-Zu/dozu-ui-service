'use client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Link from 'next/link';
import { memo, useCallback } from 'react';
import { useMindMapContext } from '../context/MindMapContext';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { ExternalLink, MoveLeft, MoveRight } from 'lucide-react';
import { pdfjs } from 'react-pdf';
import { Document, Page } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
//Configure PDF.js worker with external CDN - DuyND

const FileSheet = () => {
    const {
        isFileSheetOpen,
        setIsFileSheetOpen,
        pdfUrl,
        currentPageNumber,
        totalPages,
        setTotalPages,
        setCurrentPageNumber,
    } = useMindMapContext();

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setTotalPages(numPages);
    }

    const handleOnOpenChange = (open: boolean) => {
        setIsFileSheetOpen(open);
    };

    const goToNextPage = useCallback(() => {
        if (currentPageNumber < totalPages) {
            setCurrentPageNumber(currentPageNumber + 1);
        }
    }, [currentPageNumber, totalPages]);

    const goToPreviousPage = useCallback(() => {
        if (currentPageNumber > 1) {
            setCurrentPageNumber(currentPageNumber - 1);
        }
    }, [currentPageNumber]);

    if (!pdfUrl) return null;

    return (
        <Sheet open={isFileSheetOpen} onOpenChange={handleOnOpenChange}>
            <SheetContent className="w-[1000px] min-w-[800px]" side="left">
                <SheetHeader>
                    <SheetTitle>Uploaded Document</SheetTitle>

                    <SheetDescription>Content</SheetDescription>
                </SheetHeader>
                <div className="grid w-full gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Button disabled={currentPageNumber <= 1} variant={'outline'} onClick={goToPreviousPage}>
                            <MoveLeft /> Previous page
                        </Button>
                        <Button disabled={currentPageNumber >= totalPages} variant={'outline'} onClick={goToNextPage}>
                            <MoveRight /> Next page
                        </Button>
                    </div>

                    <Button variant={'outline'} asChild>
                        <Link href={pdfUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink />
                            Open PDF in new tab
                        </Link>
                    </Button>

                    {/* Display extraction results */}
                    {/* {extractionResult && !extractionResult.success && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-red-600 text-sm">Error: {extractionResult.error}</p>
                        </div>
                    )}

                    {extractionResult && extractionResult.success && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <p className="text-green-600 text-sm">
                                Successfully extracted text from {extractionResult.extractedPages.length} pages
                                {extractionResult.extractedPages.length > 0 &&
                                    ` (${extractionResult.extractedPages.join(', ')})`}
                            </p>
                        </div>
                    )}

                    {extractedText && (
                        <div className="max-h-40 overflow-y-auto border p-2 bg-gray-50 rounded">
                            <h4 className="font-bold mb-2">Extracted Text:</h4>
                            <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
                        </div>
                    )} */}

                    <div>
                        <p>
                            Page {currentPageNumber} of {totalPages}
                        </p>
                        <Document
                            file={pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            renderMode={'canvas'}
                            onLoadError={(error) => alert('Error while loading document! ' + error.message)}
                        >
                            <Page pageNumber={currentPageNumber} />
                        </Document>
                    </div>
                </div>

                {/* </SheetFooter> */}
            </SheetContent>
        </Sheet>
    );
};

export default memo(FileSheet);
