# Multi-Language Font Configuration

This setup provides optimal font rendering for both English and Vietnamese content, solving the issue of broken Vietnamese accents and diacritics.

## Font Stack Overview

### Primary Fonts

- **Inter**: Primary font with Vietnamese subset support (handles diacritics properly)
- **Geist**: Secondary font optimized for English content

### Font Variables

- `--font-primary`: Inter with Vietnamese support
- `--font-geist`: Geist for English content
- `--font-vietnamese`: Vietnamese-optimized font stack
- `--font-english`: English-optimized font stack

## Available CSS Classes

### Tailwind Classes

- `font-primary`: Uses Inter with Vietnamese support
- `font-geist`: Uses Geist font
- `font-sans`: Default font stack with Vietnamese fallbacks

### Custom Utility Classes

- `font-vietnamese`: Vietnamese-optimized font family
- `font-english`: English-optimized font family
- `text-vietnamese`: Vietnamese text with proper line-height and spacing
- `vietnamese-text`: Vietnamese text with rendering optimizations

## Font Configuration Files

- `src/fonts/font-config.ts`: Configuration utilities and constants
- `src/components/ui/LocaleFontProvider.tsx`: Locale-aware font provider
- `src/components/examples/FontUsageExamples.tsx`: Usage examples

## Supported Languages

- **English (en)**: Uses Geist font for optimal English typography
- **Vietnamese (vi)**: Uses Inter with Vietnamese subset for proper diacritics

## Vietnamese Character Support

The configuration specifically addresses:

- ✅ Proper rendering of Vietnamese diacritics (á, à, ả, ã, ạ, etc.)
- ✅ Correct accent positioning on all characters
- ✅ Proper kerning and letter spacing for Vietnamese text
- ✅ Optimized line-height for Vietnamese readability
- ✅ Font-feature-settings for better rendering

## Technical Details

### Font Loading Strategy

- Uses Next.js font optimization with `next/font/google` for Inter
- Uses `next/font/local` for Geist fonts
- Implements font-display: swap for better loading performance
- Includes proper font fallbacks for each language

### CSS Variables Structure

```css
:root {
    --font-primary: Inter, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif;
    --font-geist: Geist, Inter, Segoe UI, sans-serif;
    --font-vietnamese: Inter, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif;
    --font-english: Geist, Inter, Segoe UI, sans-serif;
}
```

### For optimal performance:

1. Use the LocaleFontProvider component for automatic font selection
2. Apply `vietnamese-text` class to Vietnamese content containers
3. Use font preloading for critical Vietnamese text
4. Test across different browsers and devices

## Browser Support

- ✅ Chrome/Chromium-based browsers
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
