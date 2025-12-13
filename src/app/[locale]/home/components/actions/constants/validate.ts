// Add these constants at the top of the file
const MAX_FILE_SIZE_MB = 10; // 10MB for documents
const MAX_MEDIA_SIZE_MB = 50; // 50MB for audio/video
const MAX_TEXT_LENGTH = 5000; // 5000 tokens (approximate)
const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.txt'];
const ALLOWED_AUDIO_TYPES = ['.mp3', '.wav', '.m4a'];
const ALLOWED_VIDEO_TYPES = ['.mp4', '.mov', '.avi'];
const MAX_CONTENT_SIZE_KB = 256;

const FILE_TYPES_NOT_CONVERT = '.pdf';
const FILE_FORMAT = 'application/pdf';

const validateFileSize = (
    file: File,
    isMedia = false,
    maxSizeFile = MAX_FILE_SIZE_MB,
    maxFileMedia = MAX_MEDIA_SIZE_MB,
): boolean => {
    const maxSizeMB = isMedia ? maxSizeFile : maxFileMedia;
    const fileSizeMB = file.size / (1024 * 1024);
    return fileSizeMB <= maxSizeMB;
};

const getFileExtension = (file: File): string => {
    return file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
};

const validateFileType = (file: File): boolean => {
    const fileExtension = getFileExtension(file);
    return ALLOWED_FILE_TYPES.includes(fileExtension);
};

const validateMediaType = (file: File, mediaType: 'audio' | 'video'): boolean => {
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    return mediaType === 'audio'
        ? ALLOWED_AUDIO_TYPES.includes(fileExtension)
        : ALLOWED_VIDEO_TYPES.includes(fileExtension);
};

const validateTextLength = (text: string): boolean => {
    // Simple approximation: 1 token ≈ 4 characters
    return text.length <= MAX_TEXT_LENGTH * 4;
};

export {
    ALLOWED_AUDIO_TYPES,
    ALLOWED_FILE_TYPES,
    ALLOWED_VIDEO_TYPES,
    FILE_TYPES_NOT_CONVERT,
    FILE_FORMAT,
    MAX_FILE_SIZE_MB,
    MAX_MEDIA_SIZE_MB,
    MAX_TEXT_LENGTH,
    MAX_CONTENT_SIZE_KB,
    validateFileSize,
    validateFileType,
    validateMediaType,
    validateTextLength,
    getFileExtension,
};
