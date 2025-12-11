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
            console.error('Failed to load PDF.js library:', error);
            setError('Failed to initialize PDF reader. Please refresh the page.');
            return null;
        }
    }, [getDocument]);

    const handleExtractDocxToText = useCallback(() => {
        if (!file) {
            setError('No DOCX file selected');
            return;
        }

        setLoading(true);
        setError(null);
        setText(null);

        const reader = new FileReader();

        let extractContent = '';

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;

                if (!arrayBuffer) {
                    setError('Error reading file: Empty content');
                    console.error('Empty content from DOCX file');
                    return;
                }

                //page of file must be less than 100 page
                if (arrayBuffer.byteLength > 6 * 1024 * 1024) {
                    setError('File too large. Over 100 MB.'); // 6 MB limit
                    return;
                }

                const result = await mammoth.extractRawText({ arrayBuffer });
                // The raw text content
                const content = result.value;

                if (!content) {
                    setError('Error extracting text: Empty content');
                    return;
                }

                extractContent = content;

                setText(content);
            } catch (err) {
                setError(`Error processing DOCX file`);
            } finally {
                setLoading(false);
            }
        };

        reader.onerror = (e) => {
            setError('Error reading DOCX file');
            setLoading(false);
            setText(null);
        };

        reader.readAsArrayBuffer(file);

        return extractContent;
    }, [file]);

    const handleExtractTxtToText = useCallback(() => {
        if (!file) {
            setError('No text file selected');
            return;
        }

        setLoading(true);
        setError(null);
        setText(null);

        const reader = new FileReader();

        let extractContent = '';

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                if (!content) {
                    setError('Error reading file: Empty content');
                    console.error('Empty content from text file');
                    return;
                }

                extractContent = content;

                setText(content);
            } catch (err) {
                console.error('Error processing text file:', err);
                setError(`Error processing text file: ${err instanceof Error ? err.message : 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        reader.onerror = (e) => {
            console.error('FileReader error:', e);
            setError('Error reading text file');
            setLoading(false);
            setText(null);
        };

        try {
            // Read file as text - this is the appropriate method for .txt file
            reader.readAsText(file);
        } catch (err) {
            console.error('Error initiating file read:', err);
            setError(`Failed to read text file: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }

        return extractContent;
    }, [file]);

    /**
     * Extracts text from a PDF file using pdfjs-dist.
     */
    const handleExtractPdfToText = useCallback(async () => {
        if (!file) {
            setError('No PDF file selected');
            return;
        }

        setLoading(true);
        setError(null);
        setText(null);

        // Load PDF library when needed
        const pdfGetDocument = await loadPdfLibrary();
        if (!pdfGetDocument) {
            setLoading(false);
            return;
        }

        const reader = new FileReader();

        let fullText = '';

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;

                if (!arrayBuffer) {
                    setError('Error reading file.!');
                    setLoading(false);
                    return;
                }

                // Load PDF document
                const pdf = await pdfGetDocument(arrayBuffer).promise;

                if (!pdf) {
                    setError('Error loading PDF document.');
                    return;
                }

                if (pdf?.numPages) {
                    setNumPages(pdf.numPages);
                }

                // Loop through each page
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent: TextContent = await page.getTextContent();
                    const textItems: TextItem[] = textContent.items as TextItem[];

                    // Extract text from each item
                    textItems.forEach((item: TextItem) => {
                        fullText += item.str;
                    });
                    fullText += `\n ---- End of Page ${i} ----- \n`;
                }

                setText(fullText.trim());
            } catch (error) {
                setError('Error reading file pdf.');
                return '';
            } finally {
                setLoading(false);
            }

            return fullText;
        };

        reader.onerror = (e) => {
            setError('Error reading file');
            setLoading(false);
            setText(null);
        };
        reader.readAsArrayBuffer(file);
    }, [file, loadPdfLibrary]);

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

        console.log('Processing file:', file.name, 'Type:', file.type);

        if (file.type === 'application/pdf') {
            handleExtractPdfToText();
        } else if (file.type === 'text/plain') {
            handleExtractTxtToText();
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.type === 'application/msword' ||
            file.type === 'application/docx'
        ) {
            handleExtractDocxToText();
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

            // Load PDF library when needed
            const pdfGetDocument = await loadPdfLibrary();

            if (!pdfGetDocument) {
                setLoading(false);
                setError('No PDF library available.');
                return '';
            }

            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = async (e) => {
                    try {
                        const arrayBuffer = e.target?.result as ArrayBuffer;

                        if (!arrayBuffer) {
                            setError('Error reading file.!');
                            setLoading(false);
                            reject(new Error('Error reading file'));
                            return;
                        }

                        // Load PDF document
                        const pdf = await pdfGetDocument(arrayBuffer).promise;

                        if (!pdf) {
                            setError('Error loading PDF document.');
                            setLoading(false);
                            reject(new Error('Error loading PDF document'));
                            return;
                        }

                        if (pdf?.numPages) {
                            setNumPages(pdf.numPages);
                        }

                        // Validate page range
                        const actualStartPage = Math.max(1, startPage);
                        const actualEndPage = Math.min(pdf.numPages, endPage);

                        if (actualStartPage > actualEndPage) {
                            setError('Invalid page range: start page is greater than end page.');
                            setLoading(false);
                            reject(new Error('Invalid page range'));
                            return;
                        }

                        let fullText = '';

                        // Loop through specified page range
                        for (let i = actualStartPage; i <= actualEndPage; i++) {
                            const page = await pdf.getPage(i);
                            const textContent: TextContent = await page.getTextContent();
                            const textItems: TextItem[] = textContent?.items as TextItem[];

                            // Extract text from each item
                            textItems.forEach((item: TextItem) => {
                                fullText += item.str;
                            });
                            fullText += `\n Page ${i} \n`;
                        }

                        const finalText = fullText.trim();
                        setText(finalText);
                        setLoading(false);
                        resolve(finalText);
                    } catch (error) {
                        setError('Error reading file pdf.');
                        setLoading(false);
                        reject(error);
                    }
                };

                reader.onerror = (e) => {
                    setError('Error reading file');
                    setLoading(false);
                    reject(new Error('Error reading file'));
                };

                reader.readAsArrayBuffer(file);
            });
        },
        [file, loadPdfLibrary],
    );

    const execute = useCallback(
        async (targetFile: File, options?: ExecuteOptions) => {
            const { onSuccess, onError, onBefore, onAfter } = options || {};

            // Set the file temporarily for processing
            const originalFile = file;
            setFile(targetFile);
            setLoading(true);
            setError(null);
            setText(null);

            try {
                // Call onBefore callback
                onBefore?.(targetFile);

                let extractedText = '';

                // Determine file type and extract accordingly
                if (targetFile.type === 'application/pdf') {
                    handleExtractPdfToText();
                } else if (targetFile.type === 'text/plain') {
                    handleExtractTxtToText();
                } else if (
                    targetFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    targetFile.type === 'application/msword' ||
                    targetFile.type === 'application/docx'
                ) {
                    handleExtractDocxToText();
                } else {
                    throw new Error('Unsupported file type. Please select a PDF, TXT, or DOCX file.');
                }

                if (!extractedText) {
                    throw new Error('No text content extracted from file');
                }

                setText(extractedText.trim());

                onSuccess?.(extractedText.trim(), targetFile);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                setError(errorMessage);
                onError?.(errorMessage, targetFile);
            } finally {
                setLoading(false);
                onAfter?.(targetFile);
                // Restore original file
                setFile(originalFile);
            }
        },
        [file, loadPdfLibrary],
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
