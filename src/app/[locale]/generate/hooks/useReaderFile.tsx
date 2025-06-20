'use client';

import { useState, useCallback, useEffect } from 'react';
import mammoth from 'mammoth';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { PDFDocumentProxy, TextItem, TextContent } from 'pdfjs-dist/types/src/display/api';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useCardImportSelector, useCardImportDispatch } from './useReduxStore';
import { setTextContent } from '@/app/[locale]/generate/stores/features/contentExtractionSlice';
import { setFiles, setStep } from '@/app/[locale]/generate/stores/features/importDialogSlice';

GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const useReaderFile = () => {
    const dispatch = useCardImportDispatch();

    const { files } = useCardImportSelector((state) => state.importDialog);

    const [text, setText] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    //TODO: analyze performance of this code, and check if import when component mount is better
    // useEffect(() => {
    //     const loadPdfLibrary = async () => {
    //         if (typeof window !== undefined && !pdfjs) {
    //             try {
    //                 const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
    //                 GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    //                 pdfjs = { getDocument };
    //             } catch (error) {
    //                 console.error('Failed to load PDF.js library:', error);
    //                 setError('Failed to initialize PDF reader. Please refresh the page.');
    //             }
    //         }
    //     };
    //     loadPdfLibrary();
    // }, []);

    const handleExtractDocxToText = useCallback(() => {
        const file = files?.[0];
        if (!file) {
            setError('No DOCX file selected');
            return;
        }
        setLoading(true);
        setError(null);
        setText(null);

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                if (!arrayBuffer) {
                    setError('Error reading file: Empty content');
                    console.error('Empty content from DOCX file');
                    return;
                }

                const result = await mammoth.extractRawText({ arrayBuffer });
                // The raw text content
                const content = result.value;
                if (!content) {
                    setError('Error extracting text: Empty content');
                    return;
                }
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
    }, [files]);

    const handleExtractTxtToText = useCallback(() => {
        const file = files?.[0];

        if (!file) {
            setError('No text file selected');
            return;
        }

        setLoading(true);
        setError(null);
        setText(null);

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                if (!content) {
                    setError('Error reading file: Empty content');
                    console.error('Empty content from text file');
                    return;
                }

                console.log(`Text file loaded successfully, ${content.length} characters`);
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
            // Read file as text - this is the appropriate method for .txt files
            reader.readAsText(file);
        } catch (err) {
            console.error('Error initiating file read:', err);
            setError(`Failed to read text file: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    }, [files, dispatch]);

    const handleExtractPdfToText = useCallback(async () => {
        const file = files?.[0];

        setLoading(true);
        setError(null);
        setText(null);

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                if (!arrayBuffer) {
                    setError('Error reading file.!');
                    setLoading(false);
                    return;
                }

                // Load PDF document
                const pdf: PDFDocumentProxy = await getDocument(arrayBuffer).promise;

                if (pdf.numPages > 100) {
                    setError('File too large. Over 100 pages.');
                    dispatch(setFiles([]));
                    return;
                }

                let fullText = '';

                // Loop through each page
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent: TextContent = await page.getTextContent();
                    const textItems: TextItem[] = textContent.items as TextItem[];

                    // Extract text from each item
                    textItems.forEach((item: TextItem) => {
                        fullText += item.str + ' ';
                    });
                }

                setText(fullText.trim());
            } catch (error) {
                console.error('Error reading PDF:', error);
                setError('Error reading file pdf.');
            } finally {
                setLoading(false);
            }
        };

        reader.onerror = (e) => {
            setError('Error reading file');
            setLoading(false);
            setText(null);
        };

        reader.readAsArrayBuffer(file);
    }, [files]);

    const handleFileChange = useCallback(() => {
        if (!files || files.length === 0) {
            return;
        }

        if (files?.[0]) {
            const file = files[0];

            console.log('Type file', file.type);

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
        }
    }, [files, handleExtractPdfToText, handleExtractTxtToText, handleExtractDocxToText]);

    useEffect(() => {
        if (files.length > 0) {
            handleFileChange();
        }
    }, [files]);

    useEffect(() => {
        if (!loading && text && !error) {
            dispatch(setTextContent(text));
            dispatch(setStep(2));
        }
    }, [text, loading]);

    return { text, loading, error };
};

export default useReaderFile;
