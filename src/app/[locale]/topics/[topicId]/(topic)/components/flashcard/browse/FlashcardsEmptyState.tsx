import { useTranslations } from 'next-intl';
import Generate from '../../generate/Generate';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { IResponseFlashCardGenerate } from '../../../hooks/useFlashCardWorkSpace';

export default function FlashcardsEmptyState() {
    const tFlashcardLearning = useTranslations('flashcard.learning');

    const { setGeneratingFlashcards } = useTopicWorkspace();

    return (
        <div className="flex flex-col">
            <Generate
                type="flashcard"
                onSuccess={(data: IResponseFlashCardGenerate[]) => {
                    setGeneratingFlashcards(data);
                }}
            />
        </div>
    );
}
