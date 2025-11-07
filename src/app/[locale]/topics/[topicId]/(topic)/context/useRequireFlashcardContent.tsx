import { useTopicWorkspace } from './TopicWorkspaceContext';

export function useRequireFlashcards() {
    const context = useTopicWorkspace();

    if (!context.flashcards) {
        throw new Error('Workspace data is missing flashcards.');
    }

    return {
        flashcards: context.flashcards,
        setFlashcards: context.setFlashcards,
    };
}

export function useRequireLearningFlashcards() {
    const context = useTopicWorkspace();

    if (!context.learningFlashcards) {
        throw new Error('Workspace data is missing learning flashcards.');
    }

    return {
        learningFlashcards: context.learningFlashcards,
        setLearningFlashcards: context.setLearningFlashcards,
        onReviewCard: context.onReviewCard,
    };
}

export function useRequireAnkiSettings() {
    const context = useTopicWorkspace();

    if (!context.ankiSettings) {
        throw new Error('Workspace data is missing anki settings.');
    }

    return {
        ankiSettings: context.ankiSettings,
        setAnkiSettings: context.setAnkiSettings,
    };
}
