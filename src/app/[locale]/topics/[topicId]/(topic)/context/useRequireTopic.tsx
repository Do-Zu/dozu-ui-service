import { useTopicWorkspace } from './TopicWorkspaceContext';

export function useRequireTopic() {
    const context = useTopicWorkspace();

    if (!context.topic) {
        throw new Error('Workspace data is missing topic.');
    }

    return {
        topic: context.topic,
        setTopic: context.setTopic,
    };
}
