import pako from 'pako';
import { MAX_CONTENT_SIZE_KB } from './validate';

/**
 * Compresses text content using pako with maximum compression
 * This reduces payload size as much as possible before sending
 *
 * @param text The text content to compress
 * @returns Compressed binary data as string
 */
export const compressContent = (text: string): string => {
    if (!text || text.length === 0) {
        return '';
    }

    try {
        // Convert string to Uint8Array
        const textBytes = new TextEncoder().encode(text);

        // Compress the bytes with maximum level and optimal settings
        const compressedBytes = pako.deflate(textBytes, {
            level: 9, // Maximum compression level
            windowBits: 15, // Maximum window size
            memLevel: 9, // Maximum memory level
            strategy: 0, // Default strategy works best for text
        });

        // Convert to binary string representation for maximum efficiency
        const binaryString = Array.from(compressedBytes)
            .map((byte) => String.fromCharCode(byte))
            .join('');

        const originalSize = text.length;
        const compressedSize = binaryString.length;
        const compressionRatio = (compressedSize / originalSize) * 100;

        // console.log(
        //   `Max compression: Original: ${originalSize / 1024} KB, Compressed: ${compressedSize / 1024} KB, Ratio: ${compressionRatio.toFixed(2)}%`,
        // );

        return binaryString;
    } catch (error) {
        console.error('Error compressing content:', error);
        // Fall back to original text if compression fails
        return text;
    }
};

/**
 * Decompresses content previously compressed with compressContent
 *
 * @param compressedText Binary string of compressed content
 * @returns Original decompressed text
 */
export const decompressContent = (compressedText: string): string => {
    if (!compressedText || compressedText.length === 0) {
        return '';
    }

    try {
        // Convert binary string back to Uint8Array
        const compressedBytes = new Uint8Array(compressedText.split('').map((char) => char.charCodeAt(0)));

        // Decompress the bytes
        const decompressedBytes = pako.inflate(compressedBytes);

        // Convert Uint8Array back to string
        const decompressedText = new TextDecoder().decode(decompressedBytes);

        return decompressedText;
    } catch (error) {
        console.error('Error decompressing content:', error);
        return compressedText;
    }
};

/**
 * Checks if the content size after compression would exceed the allowed limit
 *
 * @param text The text content to check
 * @returns Boolean indicating if the content is too large
 */
export const isContentTooLarge = (text: string): boolean => {
    if (!text) return false;

    const compressed = compressContent(text);
    const sizeKB = compressed.length / 1024;

    return sizeKB > MAX_CONTENT_SIZE_KB;
};
