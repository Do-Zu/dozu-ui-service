import { IDueAnkiCard, IFlashcard } from '@/app/[locale]/flashcards/types/flashcard.type';
import ankiSettingService from '@/services/anki-setting/ankiSetting.service';
import flashcardService from '@/services/flashcard/flashcard.service';
import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';
import { isNilOrEmpty } from '@/utils';

export interface IFlashcardContent {
    flashcards: IFlashcard[];
    learningFlashcards: IDueAnkiCard[];
    ankiSettings: {
        settings: IAnkiSetting[];
        activeSettingId: number;
    };
}

class FlashcardContentService {
    public async getFlashcardContent({ topicId }: { topicId: number }) {
        try {
            if (isNilOrEmpty(topicId)) return;

            const [flashcards, learningFlashcards, ankiSettings] = await Promise.all([
                flashcardService.getFlashcardsForTopic(topicId),
                flashcardService.getDueAnkiCardsForTopic(topicId),
                ankiSettingService.getUserSettingsForTopic({ topicId }),
            ]);

            return { flashcards, learningFlashcards, ankiSettings };
        } catch (err) {
            throw new Error('Failed to get flashcard content, please try again.');
        }
    }
}

export default new FlashcardContentService();
