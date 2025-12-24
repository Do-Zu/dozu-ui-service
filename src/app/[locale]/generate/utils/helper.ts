export const blobToFile = (blob: Blob, fileName: string, lastModified = Date.now()): File => {
    return new File([blob], fileName, {
        type: blob.type || 'application/octet-stream',
        lastModified,
    });
};
