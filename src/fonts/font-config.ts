// Font configuration for multi-language support
// This file provides utilities for language-specific font handling

export const FONT_CONFIGS = {
    // English: Use Geist for optimal English text rendering
    en: {
        primary: 'font-geist',
        fallback: 'font-sans',
        className: 'font-geist',
    },
    // Vietnamese: Use Inter with Vietnamese subset for proper diacritics
    vi: {
        primary: 'font-primary',
        fallback: 'font-sans',
        className: 'font-primary',
    },
} as const;

export const VIETNAMESE_SAFE_FONTS = [
    'Inter',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif',
];

export const ENGLISH_OPTIMIZED_FONTS = ['Geist', 'Inter', 'Segoe UI', 'sans-serif'];

// CSS variables for different language contexts
export const FONT_CSS_VARS = {
    primary: '--font-primary', // Inter with Vietnamese support
    geist: '--font-geist', // Geist for English
    fallback: '--font-sans', // Universal fallback
};

// Utility function to get font class based on locale
export function getFontClass(locale: string): string {
    return FONT_CONFIGS[locale as keyof typeof FONT_CONFIGS]?.className || 'font-sans';
}

// Utility function to get font family CSS for specific locale
export function getFontFamily(locale: string): string {
    if (locale === 'vi') {
        return 'var(--font-primary), ' + VIETNAMESE_SAFE_FONTS.map((f) => `"${f}"`).join(', ');
    }
    return 'var(--font-geist), ' + ENGLISH_OPTIMIZED_FONTS.map((f) => `"${f}"`).join(', ');
}
