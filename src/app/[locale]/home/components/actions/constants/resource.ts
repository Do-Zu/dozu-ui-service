export const RESOURCE_CONTENT_TYPE = {
    FILE: 'file',
    YOUTUBE: 'youtube',
    WEBSITE: 'website',
    TEXT: 'text',
} as const;

export type ResourceContentType = (typeof RESOURCE_CONTENT_TYPE)[keyof typeof RESOURCE_CONTENT_TYPE];

export const IMPORT_METHOD = {
    FILE: 'file',
    TEXT: 'text',
    MEDIA: 'media',
} as const;

export type TypeImportMethod = (typeof IMPORT_METHOD)[keyof typeof IMPORT_METHOD];
