// Types for PDF Text Extraction
export interface PDFTextExtractionResult {
    text: string;
    pageCount: number;
    extractedPages: number[];
    success: boolean;
    error?: string;
}

export interface PDFPageRange {
    startPage: number;
    endPage: number;
}

export interface PDFTextExtractionOptions {
    pageRange?: PDFPageRange;
    preserveFormatting?: boolean;
    includePageSeparators?: boolean;
    pagePrefix?: string;
}

export interface PDFDocumentInfo {
    numPages: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
}

// Common loading states
export interface LoadingStates {
    isLoading: boolean;
    isSaving: boolean;
    isExtractingText: boolean;
}

// Sheet states
export interface SheetStates {
    isFileSheetOpen: boolean;
    isNodeSheetOpen: boolean;
}

// Navigation states
export interface NavigationStates {
    currentPageNumber: number;
    totalPages: number;
}

// PDF states
export interface PDFStates {
    pdfUrl: string;
    pdfFile: File | undefined;
    documentInfo: PDFDocumentInfo | null;
    extractedText: string;
    extractionResult: PDFTextExtractionResult | null;
}
