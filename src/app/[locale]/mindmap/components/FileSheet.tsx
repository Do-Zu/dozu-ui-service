'use client';
import Axios from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { pdfjs } from 'react-pdf';
import { Document, Page } from 'react-pdf';
import { ExternalLink, MoveLeft, MoveRight } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
//Configure PDF.js worker with external CDN - DuyND

type RouteParams = {
    id: string; // Assuming your dynamic route segment is named `[id]`
};

interface IFileSheetParams {
    isFileSheetOpen: boolean;
    setIsFileSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    pageNumber: number;
    setPageNumber: React.Dispatch<React.SetStateAction<number>>;
}

const FileSheet = ({ isFileSheetOpen, setIsFileSheetOpen, pageNumber, setPageNumber }: IFileSheetParams) => {
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const params = useParams<RouteParams>();
    const topicId = params?.id;
    const [numPages, setNumPages] = useState<number>(0);
    // const [pageNumber, setPageNumber] = useState<number>(1);
    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    useEffect(() => {
        const getInputSetDocument = async () => {
            const response = await Axios.get(`/input-set/document/${topicId}`, {
                responseType: 'blob',
            });
            console.log(response.data);
            const url = URL.createObjectURL(response.data);
            setPdfUrl(url);
        };
        getInputSetDocument();

        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, []);

    const handleOnOpenChange = (isFileSheetOpen: boolean) => {
        setIsFileSheetOpen(isFileSheetOpen);
    };

    if (!pdfUrl) return;
    else
        return (
            <Sheet open={isFileSheetOpen} onOpenChange={handleOnOpenChange}>
                <SheetContent className="w-[1000px] min-w-[800px]" side="left">
                    <SheetHeader>
                        <SheetTitle>Uploaded Document</SheetTitle>

                        <SheetDescription>Content</SheetDescription>
                    </SheetHeader>
                    <div className="grid w-full gap-3">
                        {' '}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                disabled={pageNumber <= 1}
                                variant={'outline'}
                                onClick={() => setPageNumber(pageNumber - 1)}
                            >
                                <MoveLeft /> Previous page
                            </Button>
                            <Button
                                disabled={pageNumber >= numPages}
                                variant={'outline'}
                                onClick={() => setPageNumber(pageNumber + 1)}
                            >
                                <MoveRight /> Next page
                            </Button>
                        </div>
                        <Button
                            // className="justify-start"
                            variant={'outline'}
                            asChild
                        >
                            <Link href={pdfUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink />
                                Open PDF in new tab
                            </Link>
                        </Button>
                        <div>
                            {/* {topicId} */}
                            <p>
                                Page {pageNumber} of {numPages}
                            </p>
                            {/* Renders the pdf file */}
                            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} renderMode={'canvas'}>
                                <Page pageNumber={pageNumber} />
                            </Document>
                        </div>
                    </div>

                    {/* </SheetFooter> */}
                </SheetContent>
            </Sheet>
        );
};

export default FileSheet;
