import { ContentType } from '../components/ContentGenerationPreview';
import { CONTENT_TYPE_GENERATE, ISseData } from '../types';

/**
 * Determines the content type based on SSE data structure
 * This can be expanded to detect different content types from the API response
 */
export const detectContentType = (sseData: ISseData | null): ContentType | null => {
    if (!sseData?.data?.data) {
        return null;
    }

    // Add logic here to detect content type based on response structure
    // For example:
    // - Check for specific properties in the data
    // - Look for type indicators in the response
    // - Use metadata from the API

    // Example detection logic (customize based on your API):
    const { type, data: dataGenerated } = sseData.data;

    if (type && (Object.keys(CONTENT_TYPE_GENERATE) as string[]).includes(type)) {
        return CONTENT_TYPE_GENERATE[type as keyof typeof CONTENT_TYPE_GENERATE] as ContentType;
    }

    if (Array.isArray(dataGenerated)) {
        const firstItem = dataGenerated[0];

        // Check if it looks like flashcard data
        if (firstItem && typeof firstItem === 'object' && 'q' in firstItem && 'a' in firstItem) {
            return 'flashcard';
        }
        
        // Check if it looks like quiz data
        if (firstItem && typeof firstItem === 'object' && 'q' in firstItem && 'o' in firstItem && 'idx' in firstItem) {
            return 'quiz';
        }

        // // Check if it looks like quiz data
        // if (firstItem && typeof firstItem === 'object' && 'question' in firstItem && 'options' in firstItem) {
        //     return 'quiz';
        // }

        // Check if it looks like mindmap data
        if (firstItem && typeof firstItem === 'object' && 'nodes' in firstItem && 'edges' in firstItem) {
            return 'mindmap';
        }
    }

    // Default to flashcard if unable to determine
    return null;
};

/**
 * Validates if the content type is supported
 */
export const isSupportedContentType = (type: string): type is ContentType => {
    return (Object.values(CONTENT_TYPE_GENERATE) as string[]).includes(type);
};

/**
 * Gets display name for content type
 */
export const getContentTypeDisplayName = (type: ContentType | null): string => {
    switch (type) {
        case 'flashcard':
            return 'Flashcard';
        case 'quiz':
            return 'Quiz';
        case 'mindmap':
            return 'Mind Map';
        default:
            return 'Content';
    }
};
