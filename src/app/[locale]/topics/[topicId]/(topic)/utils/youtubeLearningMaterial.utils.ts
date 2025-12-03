class YoutubeLearningMaterialUtils {
    public isValidYoutubeEmbed(url: string): boolean {
        try {
            const parsed = new URL(url);
            return (
                parsed.protocol === 'https:' &&
                parsed.hostname === 'www.youtube.com' &&
                parsed.pathname.startsWith('/embed/')
            );
        } catch {
            return false;
        }
    }
}

export default new YoutubeLearningMaterialUtils();
