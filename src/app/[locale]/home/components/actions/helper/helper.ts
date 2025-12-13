import { isEmpty } from '@/utils';

export const blobToFile = (blob: Blob, fileName: string, lastModified = Date.now()): File => {
    return new File([blob], fileName, {
        type: blob.type || 'application/octet-stream',
        lastModified,
    });
};

export const getFileNameWithoutExtension = (filename: string) => {
    const lastSlash = Math.max(filename.lastIndexOf('/'), filename.lastIndexOf('\\'));
    const base = lastSlash >= 0 ? filename.slice(lastSlash + 1) : filename;
    const lastDot = base.lastIndexOf('.');
    return lastDot > 0 ? base.slice(0, lastDot) : base;
};

export const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/i,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};

export const isYouTubeUrl = (url: string): boolean => {
    return !isEmpty(extractYouTubeVideoId(url));
};

export const validateUrl = (pastedUrl: string): boolean => {
    const urlPattern =
        /^(https?:\/\/)?([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6})\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

    if (isEmpty(pastedUrl)) return false;

    return urlPattern.test(pastedUrl);
};
