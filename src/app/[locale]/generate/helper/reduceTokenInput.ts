import { removeStopwords, eng, vie } from 'stopword';

export interface TokenReductionOptions {
    removeStopWords: boolean;
    removeExtraSpaces: boolean;
    removeExtraNewlines: boolean;
    removeUrls: boolean;
    replacePunctuation: boolean;
    convertToLowercase: boolean;
    replaceNumbers: boolean;
    language?: 'vietnamese' | 'english' | 'auto';
}

export interface TokenReductionResult {
    text: string;
    originalTokenCount: number;
    reducedTokenCount: number;
    reductionPercentage: number;
}

/**
 * Improved Vietnamese language detection that uses multiple indicators
 * to more accurately differentiate between Vietnamese and English text.
 *
 * @param text - The text to analyze
 * @returns 'vietnamese' or 'english' based on analysis
 */
const detectLanguage = (text: string): 'vietnamese' | 'english' => {
    if (!text.trim()) {
        return 'english'; // Default for empty text
    }

    // Vietnamese-specific diacritical marks and the letter 'đ'/'Đ'
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/g;

    // Count Vietnamese-specific characters
    const vietnameseMatches = text.match(vietnamesePattern) || [];
    const vietnameseCharCount = vietnameseMatches.length;

    // Common Vietnamese digraphs and trigraphs (letter combinations)
    const vietnameseDigraphs = ['ng', 'nh', 'th', 'tr', 'ph', 'ch', 'kh', 'gh', 'gi', 'qu', 'ngh', 'nguoi', 'tieng'];

    // Check for presence of Vietnamese word patterns
    let digraphCount = 0;
    vietnameseDigraphs.forEach((digraph) => {
        const regex = new RegExp(digraph, 'gi');
        const matches = text.match(regex) || [];
        digraphCount += matches.length;
    });

    // Calculate metrics
    const totalLength = text.length;
    const vietnameseCharRatio = vietnameseCharCount / totalLength;
    const weightedScore = vietnameseCharRatio * 0.8 + (digraphCount / (totalLength / 3)) * 0.2;

    // Decision thresholds
    // 1. Strong Vietnamese indicator if >3% characters have diacritics
    if (vietnameseCharRatio > 0.03) {
        return 'vietnamese';
    }

    // 2. Consider weighted score for borderline cases
    if (weightedScore > 0.02) {
        return 'vietnamese';
    }

    // Check for specific Vietnamese words as a final check
    const vietnameseCommonWords = ['và', 'của', 'không', 'là', 'có', 'được', 'trong', 'một'];
    for (const word of vietnameseCommonWords) {
        if (text.toLowerCase().includes(word)) {
            return 'vietnamese';
        }
    }

    return 'english';
};

// Estimate token count - this is a simple estimation
export const estimateTokenCount = (text: string): number => {
    // Approximately 4 characters per token for English, 3 for Vietnamese
    // This is a simple approximation, actual tokenization depends on the model
    const tokensPerChar = 4;
    return Math.ceil(text.length / tokensPerChar);
};

/**
 * Reduces the token count of input text by applying various optimization techniques
 * @param inputText The text to optimize
 * @param options Configuration options for optimization
 * @returns The optimized text and statistics about the reduction
 */
export function reduceTokenInput(
    inputText: string,
    options: TokenReductionOptions = {
        removeStopWords: true,
        removeExtraSpaces: true,
        removeExtraNewlines: true,
        removeUrls: true,
        replacePunctuation: true,
        convertToLowercase: true,
        replaceNumbers: false,
        language: 'auto',
    },
): TokenReductionResult {
    if (!inputText || inputText.trim() === '') {
        return {
            text: '',
            originalTokenCount: 0,
            reducedTokenCount: 0,
            reductionPercentage: 0,
        };
    }

    // Save original text for token count comparison
    const originalText = inputText;
    let result = inputText;

    if (options.convertToLowercase) {
        result = result.toLowerCase();
    }

    if (options.removeUrls) {
        result = result.replace(/https?:\/\/[^\s]+/g, '[URL]');
    }

    if (options.replaceNumbers) {
        // Replace large numbers with shorter tokens
        result = result.replace(/\b\d{7,}\b/g, '[NUM]');
        // Replace medium numbers while preserving some precision
        result = result.replace(/\b\d{4,6}\b/g, (n) => n.charAt(0) + 'k');
    }

    if (options.replacePunctuation) {
        // Remove unnecessary punctuation that doesn't change meaning significantly
        result = result.replace(/[,.;:!?'"(){}\[\]<>]/g, ' ');
        // Collapse multiple symbols
        result = result.replace(/[-_=+*\/\\|@#$%^&]+/g, ' ');
    }

    if (options.removeExtraNewlines) {
        result = result.replace(/\n{2,}/g, '\n').trim();
    }

    if (options.removeStopWords) {
        // Split by spaces and filter out empty strings
        const tokens = result.split(/\s+/).filter((token) => token.length > 0);
        result = removeStopwords(tokens).join(' ');
    }

    if (options.removeExtraSpaces) {
        result = result.replace(/\s{2,}/g, ' ').trim();
    }

    // Calculate token counts and reduction percentage
    const originalCount = estimateTokenCount(originalText);
    const reducedCount = estimateTokenCount(result);
    const reductionPercentage =
        originalCount > 0 ? Math.round(((originalCount - reducedCount) / originalCount) * 100) : 0;

    return {
        text: result,
        originalTokenCount: originalCount,
        reducedTokenCount: reducedCount,
        reductionPercentage: reductionPercentage,
    };
}
