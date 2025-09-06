import { ContentType } from '@/app/[locale]/generate/components/ContentGenerationPreview';
import { ROUTES } from '../constants/routes';
import {
    differenceInCalendarDays,
    differenceInCalendarMonths,
    differenceInCalendarWeeks,
    differenceInHours,
    differenceInMinutes,
} from 'date-fns';
import { getCurrentSystemDateTime, TimeUnit } from '../date/date.util';
import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';

export type IAllowedTimeUnit = (typeof TimeUnit)['MINUTE' | 'HOUR' | 'WEEK' | 'MONTH' | 'DAY'];

interface ISubtractedDate {
    unit: IAllowedTimeUnit;
    unitAgo: number;
}

class FeedHelper {
    public getLink(topicId: string | number, contentType: ContentType) {
        let result = '';
        if (contentType === 'flashcard') {
            result = ROUTES.FLASHCARDS_BROWSE(topicId);
        } else if (contentType === 'mindmap') {
            result = ROUTES.MINDMAP_VIEW(topicId);
        } else if (contentType === 'quiz') {
            result = ROUTES.QUIZ_START(topicId);
        }
        return result;
    }

    public getSubtractedDate(createdDate: Date, currentDate: Date): ISubtractedDate {
        const minutesAgo = differenceInMinutes(currentDate, createdDate);
        const hoursAgo = differenceInHours(currentDate, createdDate);
        const weeksAgo = differenceInCalendarWeeks(currentDate, createdDate);
        const monthsAgo = differenceInCalendarMonths(currentDate, createdDate);
        const daysAgo = differenceInCalendarDays(currentDate, createdDate);
        if (minutesAgo < 60) {
            return { unit: TimeUnit.MINUTE, unitAgo: minutesAgo };
        }
        if (hoursAgo < 24) {
            return { unit: TimeUnit.HOUR, unitAgo: hoursAgo };
        }
        if (weeksAgo < 7) {
            return { unit: TimeUnit.WEEK, unitAgo: weeksAgo };
        }
        if (monthsAgo < 1) {
            return { unit: TimeUnit.MONTH, unitAgo: monthsAgo };
        }
        return { unit: TimeUnit.DAY, unitAgo: daysAgo };
    }

    public getFeedGroups(feeds: IClassFeed[]) {
        const map = new Map<IAllowedTimeUnit, IClassFeed[]>();
        const currentDate = getCurrentSystemDateTime();
        for (const feed of feeds) {
            const sub = this.getSubtractedDate(feed.createdAt, currentDate);
            const currentFeeds = map.get(sub.unit);
            if (!currentFeeds) {
                map.set(sub.unit, [feed]);
            } else {
                currentFeeds.push(feed);
            }
        }
        return map;
    }

    public getGroupLabel(unit: string) {
        switch (unit) {
            case TimeUnit.MINUTE:
                return 'A few minutes ago';
            case TimeUnit.HOUR:
                return 'Within this day';
            case TimeUnit.WEEK:
                return 'Within this week';
            case TimeUnit.MONTH:
                return 'Within this month';
            case TimeUnit.DAY:
                return 'Earlier';
        }
    }
}

export default new FeedHelper();
export const unitOrder = [TimeUnit.MINUTE, TimeUnit.HOUR, TimeUnit.WEEK, TimeUnit.MONTH, TimeUnit.DAY];
