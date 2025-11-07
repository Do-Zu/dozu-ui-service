import { usePersonalTopicWorkspace } from './PersonalTopicWorkspaceContext';

export function useRequireTopic() {
    const context = usePersonalTopicWorkspace();

    if (!context.topic) {
        throw new Error('Workspace data is missing topic.');
    }

    return {
        topic: context.topic,
        setTopic: context.setTopic,
    };
}
