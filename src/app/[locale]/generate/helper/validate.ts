// Add these constants at the top of the file
const MAX_FILE_SIZE_MB = 4; // 4MB for documents
const MAX_MEDIA_SIZE_MB = 500; // 50MB for audio/video
const MAX_TEXT_LENGTH = 5000; // 5000 tokens (approximate)
const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.txt'];
const ALLOWED_AUDIO_TYPES = ['.mp3', '.wav', '.m4a'];
const ALLOWED_VIDEO_TYPES = ['.mp4', '.mov', '.avi'];

const validateFileSize = (file: File, isMedia = false): boolean => {
  const maxSizeMB = isMedia ? MAX_MEDIA_SIZE_MB : MAX_FILE_SIZE_MB;
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= maxSizeMB;
};

const validateFileType = (file: File): boolean => {
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
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
  MAX_FILE_SIZE_MB,
  MAX_MEDIA_SIZE_MB,
  MAX_TEXT_LENGTH,
  validateFileSize,
  validateFileType,
  validateMediaType,
  validateTextLength,
};
