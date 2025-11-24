import Generate from '../../generate/Generate';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { IResponseFlashCardGenerate } from '../../../hooks/useFlashCardWorkSpace';
import { FlashcardTabEnum } from '../FlashcardContent';

export default function FlashcardsEmptyState() {
    const { setGeneratingFlashcards, setFlashcardTab } = useTopicWorkspace();

    return (
        <div className="flex flex-col">
            <Generate
                type="flashcard"
                onSuccess={(data: IResponseFlashCardGenerate[]) => {
                    setFlashcardTab(FlashcardTabEnum.EDIT);
                    setGeneratingFlashcards(data);
                }}
            />
        </div>
    );
}
