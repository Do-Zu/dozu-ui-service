import { usePersonalTopicWorkspace } from './PersonalTopicWorkspaceContext';

export function useRequireFlashcards() {
    const context = usePersonalTopicWorkspace();

    if (!context.flashcards) {
        throw new Error('Workspace data is missing flashcards.');
    }

    return {
        flashcards: context.flashcards,
        setFlashcards: context.setFlashcards,
    };
}

export function useRequireLearningFlashcards() {
    const context = usePersonalTopicWorkspace();

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
    const context = usePersonalTopicWorkspace();

    if (!context.ankiSettings) {
        throw new Error('Workspace data is missing anki settings.');
    }

    return {
        ankiSettings: context.ankiSettings,
        setAnkiSettings: context.setAnkiSettings,
    };
}
