export const RESOURCE_CONTENT_TYPE = {
    FILE: 'file',
    YOUTUBE: 'youtube',
    WEBSITE: 'website',
    TEXT: 'text',
} as const;

export type ResourceContentType = (typeof RESOURCE_CONTENT_TYPE)[keyof typeof RESOURCE_CONTENT_TYPE];
