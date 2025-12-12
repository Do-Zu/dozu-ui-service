'use client';

import { useState, useCallback, useEffect } from 'react';
import mammoth from 'mammoth';
import {
    TextItem,
    TextContent,
    DocumentInitParameters,
    TypedArray,
    PDFDocumentLoadingTask,
} from 'pdfjs-dist/types/src/display/api';

const readFileAsArrayBuffer = (inputFile: File): Promise<ArrayBuffer> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (!result) {
                reject(new Error('Empty file content'));
                return;
            }
            resolve(result as ArrayBuffer);
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsArrayBuffer(inputFile);
    });

const readFileAsText = (inputFile: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result !== 'string' || !result) {
                reject(new Error('Empty file content'));
                return;
            }
            resolve(result);
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(inputFile);
    });

interface ExecuteOptions {
    onSuccess?: (text: string, file: File) => void;
    onError?: (error: string, file: File) => void;
    onBefore?: (file: File) => void;
    onAfter?: (file: File) => void;
}

const useReaderFile = (fileInit?: File) => {
    const [file, setFile] = useState<File | undefined>(fileInit);
    const [text, setText] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [getDocument, setGetDocument] = useState<
        ((src?: string | URL | TypedArray | ArrayBuffer | DocumentInitParameters) => PDFDocumentLoadingTask) | null
    >(null);

    useEffect(() => {
        if (fileInit !== file) {
            setFile(fileInit);
            setText(null);
            setError(null);
            setLoading(false);
        }
    }, [fileInit, file]);

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

    const extractDocxText = useCallback(async (inputFile: File): Promise<string> => {
        const arrayBuffer = await readFileAsArrayBuffer(inputFile);

        // NOTE: original code enforced a 6MB limit but displayed a "100 MB" message.
        // Preserve the effective limit; adjust message to match.
        if (arrayBuffer.byteLength > 6 * 1024 * 1024) {
            throw new Error('File too large. Maximum 6 MB.');
        }

        const result = await mammoth.extractRawText({ arrayBuffer });
        const content = result.value;
        if (!content) {
            throw new Error('Error extracting text: Empty content');
        }
        return content;
    }, []);

    const extractTxtText = useCallback(async (inputFile: File): Promise<string> => {
        const content = await readFileAsText(inputFile);
        if (!content) {
            throw new Error('Error reading file: Empty content');
        }
        return content;
    }, []);

    const extractPdfText = useCallback(
        async (
            inputFile: File,
            range?: { startPage: number; endPage: number },
        ): Promise<{ text: string; pages: number }> => {
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
            for (let i = actualStartPage; i <= actualEndPage; i++) {
                const page = await pdf.getPage(i);
                const textContent: TextContent = await page.getTextContent();
                const textItems: TextItem[] = textContent.items as TextItem[];

                textItems.forEach((item: TextItem) => {
                    fullText += item.str;
                });

                if (!range) {
                    fullText += `\n ---- End of Page ${i} ----- \n`;
                } else {
                    fullText += `\n Page ${i} \n`;
                }
            }

            return { text: fullText.trim(), pages };
        },
        [loadPdfLibrary],
    );

    const handleExtractDocxToText = useCallback(
        async (inputFile?: File): Promise<string> => {
            const activeFile = inputFile ?? file;
            if (!activeFile) {
                setError('No DOCX file selected');
                return '';
            }

            setLoading(true);
            setError(null);
            setText(null);

            try {
                const content = await extractDocxText(activeFile);
                setText(content);
                return content;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Error processing DOCX file';
                setError(message);
                return '';
            } finally {
                setLoading(false);
            }
        },
        [extractDocxText, file],
    );

    const handleExtractTxtToText = useCallback(
        async (inputFile?: File): Promise<string> => {
            const activeFile = inputFile ?? file;
            if (!activeFile) {
                setError('No text file selected');
                return '';
            }

            setLoading(true);
            setError(null);
            setText(null);

            try {
                const content = await extractTxtText(activeFile);
                setText(content);
                return content;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Error processing text file';
                setError(message);
                return '';
            } finally {
                setLoading(false);
            }
        },
        [extractTxtText, file],
    );

    /**
     * Extracts text from a PDF file using pdfjs-dist.
     */
    const handleExtractPdfToText = useCallback(
        async (inputFile?: File): Promise<string> => {
            const activeFile = inputFile ?? file;
            if (!activeFile) {
                setError('No PDF file selected');
                return '';
            }

            setLoading(true);
            setError(null);
            setText(null);

            try {
                const result = await extractPdfText(activeFile);
                setNumPages(result.pages);
                setText(result.text);
                return result.text;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Error reading file pdf.';
                setError(message);
                return '';
            } finally {
                setLoading(false);
            }
        },
        [extractPdfText, file],
    );

    const handleFileChange = useCallback(() => {
        if (!file) {
            setText(null);
            setError(null);
            return;
        }

        // Skip processing if already processing or already have text for this file
        if (loading) {
            return;
        }

        if (file.type === 'application/pdf') {
            void handleExtractPdfToText(file);
        } else if (file.type === 'text/plain') {
            void handleExtractTxtToText(file);
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.type === 'application/msword' ||
            file.type === 'application/docx'
        ) {
            void handleExtractDocxToText(file);
        } else {
            setError('Unsupported file type. Please select a PDF, TXT, or DOCX file.');
            setLoading(false);
        }
    }, [file, loading, handleExtractPdfToText, handleExtractTxtToText, handleExtractDocxToText]);

    /**
     * Extracts text from a PDF file using pdfjs-dist for a specific page range.
     */
    const handleExtractPdfToTextByRange = useCallback(
        async (startPage: number, endPage: number): Promise<string> => {
            setLoading(true);
            setError(null);

            if (!file) {
                setLoading(false);
                setError('No file selected.');
                return '';
            }

            try {
                const result = await extractPdfText(file, { startPage, endPage });
                setNumPages(result.pages);
                setText(result.text);
                return result.text;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Error reading file pdf.';
                setError(message);
                return '';
            } finally {
                setLoading(false);
            }
        },
        [extractPdfText, file],
    );

    const execute = useCallback(
        async (targetFile: File, options?: ExecuteOptions) => {
            const { onSuccess, onError, onBefore, onAfter } = options || {};

            // Optionally reflect the file in state, but never rely on it for extraction.
            const originalFile = file;
            setFile(targetFile);

            try {
                // Call onBefore callback
                onBefore?.(targetFile);

                setLoading(true);
                setError(null);
                setText(null);

                let extractedText = '';

                if (targetFile.type === 'application/pdf') {
                    extractedText = await handleExtractPdfToText(targetFile);
                } else if (targetFile.type === 'text/plain') {
                    extractedText = await handleExtractTxtToText(targetFile);
                } else if (
                    targetFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    targetFile.type === 'application/msword' ||
                    targetFile.type === 'application/docx'
                ) {
                    extractedText = await handleExtractDocxToText(targetFile);
                } else {
                    throw new Error('Unsupported file type. Please select a PDF, TXT, or DOCX file.');
                }

                const finalText = extractedText.trim();
                if (!finalText) {
                    throw new Error('No text content extracted from file');
                }

                onSuccess?.(finalText, targetFile);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                setError(errorMessage);
                onError?.(errorMessage, targetFile);
            } finally {
                onAfter?.(targetFile);
                // Restore original file
                setFile(originalFile);
                setLoading(false);
            }
        },
        [file, handleExtractPdfToText, handleExtractTxtToText, handleExtractDocxToText],
    );

    // Process file when file changes
    useEffect(() => {
        if (file && !loading && !text && !error) {
            handleFileChange();
        }
    }, [file, handleFileChange, text, error]);

    return {
        text,
        numPages,
        error,
        file,
        // Additional utilities
        hasFile: !!file,
        isProcessing: loading,
        hasError: !!error,
        hasText: !!text && !error,
        // File info
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type,
        extractTextByRange: handleExtractPdfToTextByRange,
        execute,
    };
};

export default useReaderFile;
