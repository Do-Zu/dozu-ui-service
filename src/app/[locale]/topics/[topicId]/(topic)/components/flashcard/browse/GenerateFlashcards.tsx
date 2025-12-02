import Generate from '../../generate/Generate';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { IResponseFlashCardGenerate } from '../../../hooks/useFlashCardWorkSpace';
import { FlashcardTabEnum } from '../FlashcardContent';
import { METHOD_LEARNING } from '@/utils/constants/method';

export default function GenerateFlashcards({ message }: { message?: string }) {
    const { setGeneratingFlashcards, setFlashcardTab, setTab } = useTopicWorkspace();

    return (
        <div className="flex flex-col gap-2">
            <Generate
                type="flashcard"
                onSuccess={(data: IResponseFlashCardGenerate[]) => {
                    setTab(METHOD_LEARNING.FLASHCARD);
                    setFlashcardTab(FlashcardTabEnum.EDIT);
                    setGeneratingFlashcards(data);
                }}
            />
            {message ? <div className="px-8 text-center flex items-center justify-center">{message}</div> : null}
        </div>
    );
}
