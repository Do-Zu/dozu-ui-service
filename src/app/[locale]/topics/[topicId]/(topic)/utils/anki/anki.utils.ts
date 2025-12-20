import { IAnkiCardReviewed } from '@/app/[locale]/flashcards/types/flashcard.type';
import { TimeUnit } from '@/utils';
import { learnAheadLimit } from '../../constants/anki.constant';

class AnkiUtils {
    public shouldReviewNow(reviewedCard: IAnkiCardReviewed) {
        return (
            reviewedCard.nextReviewInterval.timeUnit === TimeUnit.MINUTE &&
            reviewedCard.nextReviewInterval.interval <= learnAheadLimit
        );
    }
}

export default new AnkiUtils();
