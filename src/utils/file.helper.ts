class FileHelper {
    public validateFileSize(file: File, maxMB: number = 4) {
        const maxSize = maxMB * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error(`File size exceeds ${maxMB}MB. Please choose a smaller image.`);
        }
    }
}

export default new FileHelper();
