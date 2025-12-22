import {
    TextItem,
    TextContent,
    DocumentInitParameters,
    TypedArray,
    PDFDocumentLoadingTask,
} from 'pdfjs-dist/types/src/display/api';
import React, { useCallback, useState } from 'react';
import { readFileAsArrayBuffer } from './useReaderFile';
import { safeDestructure } from '@/utils';

export type PdfPageText = { page: number; text: string };
export type ExtractResult = { text: string; pages: number; pageTexts: PdfPageText[] };

interface Props {
    onExtractFullSuccess?: (extractResult: ExtractResult) => void;
    onExtractRangeSuccess?: (extractResult: ExtractResult) => void;
}

export default function usePdfReader(args?: Props) {
    const { onExtractFullSuccess, onExtractRangeSuccess } = safeDestructure(args);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [text, setText] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);

    const [getDocument, setGetDocument] = useState<
        ((src?: string | URL | TypedArray | ArrayBuffer | DocumentInitParameters) => PDFDocumentLoadingTask) | null
    >(null);

    // Lazy load PDF library only when needed
    const loadPdfLibrary = useCallback(async () => {
        if (getDocument) return getDocument;

        try {
            const { getDocument: pdfGetDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
            GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
            setGetDocument(() => pdfGetDocument);
            return pdfGetDocument;
        } catch (error) {
            setError('Failed to initialize PDF reader. Please refresh the page.');
            return null;
        }
    }, [getDocument]);

    const extractPdfText = useCallback(
        async (inputFile: File, range?: { startPage: number; endPage: number }): Promise<ExtractResult> => {
            const pdfGetDocument = await loadPdfLibrary();
            if (!pdfGetDocument) {
                throw new Error('Failed to initialize PDF reader. Please refresh the page.');
            }

            const arrayBuffer = await readFileAsArrayBuffer(inputFile);
            const pdf = await pdfGetDocument(arrayBuffer).promise;

            if (!pdf) {
                throw new Error('Error loading PDF document.');
            }

            const pages = pdf.numPages;
            const actualStartPage = range ? Math.max(1, range.startPage) : 1;
            const actualEndPage = range ? Math.min(pages, range.endPage) : pages;

            if (actualStartPage > actualEndPage) {
                throw new Error('Invalid page range: start page is greater than end page.');
            }

            let fullText = '';
            let pageTexts: PdfPageText[] = [];
            for (let i = actualStartPage; i <= actualEndPage; i++) {
                let pageText = '';
                const page = await pdf.getPage(i);
                const textContent: TextContent = await page.getTextContent();
                const textItems: TextItem[] = textContent.items as TextItem[];

                textItems.forEach((item: TextItem) => {
                    pageText += item.str;
                });

                if (!range) {
                    pageText += `\n ---- End of Page ${i} ----- \n`;
                } else {
                    pageText += `\n Page ${i} \n`;
                }

                pageTexts.push({ page: i, text: pageText.trim() });
                fullText += pageText;
            }

            return { text: fullText.trim(), pages, pageTexts };
        },
        [loadPdfLibrary],
    );

    /**
     * Extracts text from a PDF file using pdfjs-dist.
     */
    const handleExtractPdfToText = useCallback(
        async (inputFile: File): Promise<string> => {
            if (!inputFile) {
                setError('No PDF file selected');
                return '';
            }

            setLoading(true);
            setError(null);
            setText(null);

            try {
                const result = await extractPdfText(inputFile);
                setNumPages(result.pages);
                setText(result.text);
                onExtractFullSuccess?.(result);
                return result.text;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Error reading file pdf.';
                setError(message);
                return '';
            } finally {
                setLoading(false);
            }
        },
        [extractPdfText],
    );

    const handleExtractPdfToTextByRange = useCallback(
        async (inputFile: File, { startPage, endPage }: { startPage: number; endPage: number }): Promise<string> => {
            setLoading(true);
            setError(null);

            if (!inputFile) {
                setLoading(false);
                setError('No PDF file selected.');
                return '';
            }

            try {
                const result = await extractPdfText(inputFile, { startPage, endPage });
                setNumPages(result.pages);
                setText(result.text);
                onExtractRangeSuccess?.(result);
                return result.text;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Error reading file pdf.';
                setError(message);
                return '';
            } finally {
                setLoading(false);
            }
        },
        [extractPdfText],
    );

    return {
        loading,
        error,
        extractPdfToText: handleExtractPdfToText,
        extractPdfToTextByRange: handleExtractPdfToTextByRange,
        text,
        numPages,
    };
}
