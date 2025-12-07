'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import toastHelper from '@/utils/toast.helper';
import { Download, Loader2, Maximize, Minimize, RotateCwSquare } from 'lucide-react';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import React, {
    ChangeEvent,
    Dispatch,
    forwardRef,
    memo,
    RefObject,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { Input } from '@/components/ui/input';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ToolbarProps {
    pdfUrl: string;
    fileName: string;
    onRotateClick: () => void;
    scale: string;
    onScaleSelect: (value: string) => void;
    isFullScreen: boolean;
    onScreenModeToogle: () => void;

    pageNumber: number;
    setPageNumber: Dispatch<SetStateAction<number>>;
    numPages: number;
}

const scaleOptions = ['fit', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1', '1.1', '1.2'];

function PdfToolbar({
    pdfUrl,
    fileName,
    onRotateClick,
    scale,
    onScaleSelect,
    isFullScreen,
    onScreenModeToogle,
    pageNumber,
    setPageNumber,
    numPages,
}: ToolbarProps) {
    function onPageNumberChange(event: ChangeEvent<HTMLInputElement>) {
        const raw = event.target.value;
        const value = Number(raw);
        if (isNaN(value)) {
            setPageNumber(1);
            return;
        }
        const newPageNumber = Math.min(Math.max(1, value), numPages);
        setPageNumber(newPageNumber);
    }

    return (
        <div className="flex h-14 w-full items-center border rounded-md bg-background px-3 shadow-sm">
            <div className="flex-1"></div>

            <div className="flex flex-shrink-0 items-center gap-2">
                <div className="flex items-center gap-1 text-sm ">
                    <Input className="w-10 h-6 px-2 text-center" value={pageNumber} onChange={onPageNumberChange} />
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">{numPages}</span>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Select defaultValue="fit" value={scale} onValueChange={onScaleSelect}>
                    <SelectTrigger className="h-8 w-[110px] text-sm">
                        <SelectValue placeholder="Page fit" />
                    </SelectTrigger>
                    <SelectContent>
                        {scaleOptions.map((value) => {
                            if (value === 'fit')
                                return (
                                    <SelectItem key={value} value={value}>
                                        Page fit
                                    </SelectItem>
                                );
                            return (
                                <SelectItem key={value} value={value}>
                                    {Math.round((Number(value) || 0.1) * 100)}%
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-1 items-center justify-end">
                <Button variant="ghost" size="icon" onClick={onRotateClick}>
                    <RotateCwSquare className="h-4 w-4" />
                </Button>

                <a
                    className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    href={pdfUrl}
                    download={fileName}
                    aria-label="Download PDF"
                    title="Download PDF"
                >
                    <Download className="h-4 w-4" />
                </a>

                <Button variant="ghost" size="icon" onClick={onScreenModeToogle}>
                    {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
}

interface Props {
    pdfUrl: string;
    fileName: string;
}

const pagesPerDownload = 5;
const pagesGap = 2;

const CustomPDFViewer = forwardRef<HTMLDivElement, Props>(({ pdfUrl, fileName }, ref) => {
    const { pageNumber, setPageNumber, isPdfViewerFullscreen, setIsPdfViewerFullScreen } = useTopicWorkspace();

    const [numPages, setNumPages] = useState<number | null>(null);
    const documentRef = useRef<HTMLDivElement>(null);
    const [documentSize, setDocumentSize] = useState<{ width: number; height: number }>();
    const [documentScale, setDocumentScale] = useState<number>(1);

    const [pdfSize, setPdfSize] = useState<{ width: number; height: number }>();
    const [rotate, setRotate] = useState<number>(0);
    const [selectedScaleOption, setSelectedScaleOption] = useState<string>('fit');
    const [visiblePages, setVisiblePages] = useState<number>(pagesPerDownload);

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

    // if user clicks page to view content in node (mindmap), then set visible pages so user can view content
    useEffect(() => {
        if (pageNumber > visiblePages) {
            setVisiblePages(pageNumber + 1);
        }
    }, [pageNumber]);

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

    function onRotateClick() {
        setRotate((prev) => {
            const result = prev + 90;
            return result === 360 ? 0 : result;
        });
    }

    function onScaleSelect(value: string) {
        setSelectedScaleOption(value);
    }

    function handleDocumentScroll() {
        if (!pdfSize || !documentRef.current) return;
        const pdfHeightByScale = pdfSize.height * documentScale;
        const scrollTop = documentRef.current.scrollTop;
        const newPageNumber = Math.floor(scrollTop / pdfHeightByScale) + 1;
        if (visiblePages - newPageNumber <= pagesGap) {
            setVisiblePages((prev) => prev + pagesPerDownload);
        }
        if (newPageNumber !== pageNumber) setPageNumber(newPageNumber);
    }

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (selectedScaleOption === 'fit') {
            if (documentSize && pdfSize) {
                timeout = setTimeout(() => {
                    setDocumentScale(documentSize.width / pdfSize.width);
                }, 100);
            }
        } else {
            const numericScale = Number(selectedScaleOption);
            setDocumentScale(isNaN(numericScale) ? 1 : numericScale);
        }
        return () => {
            clearTimeout(timeout);
        };
    }, [selectedScaleOption, documentSize?.width, documentSize?.height, pdfSize?.width, pdfSize?.height]);

    useEffect(() => {
        if (!pdfSize || !documentRef.current) return;
        const pdfHeightByScale = pdfSize.height * documentScale;
        const scrollTop = documentRef.current.scrollTop;
        const currentPageNumber = Math.floor(scrollTop / pdfHeightByScale) + 1;

        if (currentPageNumber === pageNumber) {
            return;
        }

        const nextScrollTop = (pageNumber - 0.95) * pdfHeightByScale;
        documentRef.current.scrollTo({ top: nextScrollTop, behavior: 'instant' });
    }, [pdfSize?.width, pdfSize?.height, pageNumber, documentScale]);

    function onScreenModeToogle() {
        setIsPdfViewerFullScreen((prev) => !prev);
    }

    function onPageLoading(pageNumber: number) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-2">
            <PdfToolbar
                pdfUrl={pdfUrl}
                fileName={fileName}
                onRotateClick={onRotateClick}
                scale={selectedScaleOption}
                onScaleSelect={onScaleSelect}
                isFullScreen={isPdfViewerFullscreen}
                onScreenModeToogle={onScreenModeToogle}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                numPages={numPages || 0}
            />
            <div className="h-full border rounded-md p-2" ref={ref}>
                <Document
                    file={pdfUrl}
                    onLoadError={onDocumentLoadError}
                    onLoadSuccess={onDocumentLoadSuccess}
                    inputRef={documentRef}
                    onScroll={handleDocumentScroll}
                    className="h-full overflow-y-auto"
                >
                    {Array.from({ length: Math.min(numPages || 0, visiblePages) }, (_, index) => {
                        const pageNumber = index + 1;
                        return (
                            <Page
                                key={`page_${pageNumber}`}
                                pageNumber={pageNumber}
                                scale={documentScale}
                                rotate={rotate}
                                loading={() => onPageLoading(pageNumber)}
                            ></Page>
                        );
                    })}
                </Document>
            </div>
        </div>
    );
});

CustomPDFViewer.displayName = 'CustomPDFViewer';

export default memo(CustomPDFViewer);
