import { IBaseIntervalWithDeviation, INextReviewInterval } from '@/types/anki';
import { TimeUnit } from '../date/date.util';

class FlashcardHelper {
    public formatInterval({
        nextInterval,
        baseIntervalWithDeviation,
    }: {
        nextInterval: INextReviewInterval;
        baseIntervalWithDeviation: IBaseIntervalWithDeviation | null;
    }): string {
        const { interval, timeUnit } = nextInterval;

        if (baseIntervalWithDeviation) {
            const { baseInterval, deviation } = baseIntervalWithDeviation;
            return `${baseInterval}${deviation > 0 ? ` ± ${deviation}` : ''} days`;
        }

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
