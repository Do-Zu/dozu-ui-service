import { INextReviewInterval } from "@/types/anki";
import { TimeUnit } from "../date/date.util";

class FlashcardHelper {
    public formatInterval(nextInterval: INextReviewInterval): string {
        const { interval, timeUnit } = nextInterval;

        switch (timeUnit) {
            case TimeUnit.MINUTE:
                return `< ${Math.round(interval)} ${Math.round(interval) > 1 ? 'minutes' : 'minute'}`;
            case TimeUnit.HOUR:
                return `${interval} ${interval > 1 ? 'hours' : 'hour'}`;
            case TimeUnit.DAY:
                return `${interval} ${interval > 1 ? 'days' : 'day'}`;
            default:
                return `${interval} ${timeUnit}`;
        }
    }
}

export default new FlashcardHelper();
