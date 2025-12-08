import { useState, useCallback } from 'react';
import Axios from '@/api/axios';
import { blobToFile } from '../utils/helper';
import { isNilOrEmpty } from '@/utils';

/**
 * Hook for converting website URLs to PDF format
 *
 * @example
 * const { convertUrlToPdf, isConverting, error } = useUrlToPdfConverter();
 *
 * const handleConvert = async () => {
 *   const file = await convertUrlToPdf('https://example.com');
 *   if (file) {
 *     // Handle the PDF file
 *   }
 * };
 */

interface ConvertUrlToPdfOptions {
    /** Custom filename for the generated PDF. If not provided, generates from URL hostname */
    filename?: string;
    /** Callback function when conversion starts */
    onStart?: () => void;
    /** Callback function when conversion succeeds */
    onSuccess?: (file: File) => void;
    /** Callback function when conversion fails */
    onError?: (error: Error) => void;
    /** Callback function when conversion completes (success or failure) */
    onComplete?: () => void;
}

interface UseUrlToPdfConverterReturn {
    /** Function to convert a URL to PDF */
    convertUrlToPdf: (url: string, options?: ConvertUrlToPdfOptions) => Promise<File | null>;
    /** Loading state during conversion */
    isConverting: boolean;
    /** Error message if conversion fails */
    error: string | null;
    /** Clear error state */
    clearError: () => void;
}

const API_CONVERT_URL_ENDPOINT = '/convert/url';
const PDF_MIME_TYPE = 'application/pdf';

/**
 * Generates a filename for the PDF based on the URL
 */
const generateFilename = (url: string): string => {
    try {
        const hostname = new URL(url).hostname;
        const timestamp = Date.now();
        return `${hostname}-${timestamp}.pdf`;
    } catch {
        return `website-${Date.now()}.pdf`;
    }
};

/**
 * Validates if the provided string is a valid URL
 */
const isValidUrl = (url: string): boolean => {
    if (isNilOrEmpty(url)) {
        return false;
    }

    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Creates a Blob from ArrayBuffer with PDF mime type
 */
const createPdfBlob = (arrayBuffer: ArrayBuffer): Blob => {
    return new Blob([arrayBuffer], { type: PDF_MIME_TYPE });
};

/**
 * Converts PDF blob to File object
 */
const convertBlobToFile = (blob: Blob, filename: string): File => {
    return blobToFile(blob, filename);
};

export const useUrlToPdfConverter = (): UseUrlToPdfConverterReturn => {
    const [isConverting, setIsConverting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Fetches the PDF from the conversion API
     */
    const fetchPdfFromApi = async (url: string): Promise<ArrayBuffer> => {
        const response = await Axios.post<ArrayBuffer>(
            API_CONVERT_URL_ENDPOINT,
            { url },
            {
                responseType: 'arraybuffer',
            },
        );

        if (!response?.data) {
            throw new Error('No data received from conversion API');
        }

        return response.data;
    };

    /**
     * Converts a website URL to a PDF file
     *
     * @param url - The URL to convert
     * @param options - Optional configuration for the conversion
     * @returns Promise resolving to a File object or null if conversion fails
     */
    const convertUrlToPdf = useCallback(async (url: string, options?: ConvertUrlToPdfOptions): Promise<File | null> => {
        // Clear previous error
        setError(null);

        // Validate URL
        if (!isValidUrl(url)) {
            const errorMessage = 'Invalid URL provided';
            setError(errorMessage);
            options?.onError?.(new Error(errorMessage));
            return null;
        }

        setIsConverting(true);
        options?.onStart?.();

        try {
            // Fetch PDF data from API
            const arrayBuffer = await fetchPdfFromApi(url);

            // Convert ArrayBuffer to Blob
            const pdfBlob = createPdfBlob(arrayBuffer);

            // Generate filename
            const filename = options?.filename || generateFilename(url);

            // Convert Blob to File
            const file = convertBlobToFile(pdfBlob, filename);

            options?.onSuccess?.(file);
            return file;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to convert URL to PDF';

            setError(errorMessage);
            options?.onError?.(err instanceof Error ? err : new Error(errorMessage));
            return null;
        } finally {
            setIsConverting(false);
            options?.onComplete?.();
        }
    }, []);

    return {
        convertUrlToPdf,
        isConverting,
        error,
        clearError,
    };
};

export default useUrlToPdfConverter;
