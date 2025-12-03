class TopicUtils {
    public getDisplayTopicName(name: string) {
        if (!name) return '';
        const len = 15;
        return name.slice(0, len) + (name.length > len ? '...' : '');
    }
}

export default new TopicUtils();
