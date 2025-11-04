class AttachmentUtils {
    public formatContentType(contentType: string | null) {
        if (!contentType) return '';
        return contentType.charAt(0).toUpperCase() + contentType.slice(1);
    }
}

export default new AttachmentUtils();
