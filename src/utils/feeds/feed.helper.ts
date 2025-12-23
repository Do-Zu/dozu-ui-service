import { ContentType } from '@/app/[locale]/generate/components/ContentGenerationPreview';
import { ROUTES } from '../constants/routes';
import { differenceInHours, differenceInMinutes, isSameDay, isSameMonth, isSameWeek } from 'date-fns';
import { getCurrentSystemDateTime, TimeUnit } from '../date/date.util';
import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';
import { parseISOToLocalDate } from '../date/timezone';

export type IAllowedTimeUnit = TimeUnit | 'longTimeAgo';

export interface ISubtractedDate {
    unit: IAllowedTimeUnit;
    unitAgo?: number;
}

export interface IFeedGroup {
    feed: IClassFeed;
    group: ISubtractedDate;
}

class FeedHelper {
    public getLink(classId: number, topicId: string | number, contentType: ContentType) {
        const parsedTopicId = typeof topicId === 'string' ? parseInt(topicId) : topicId;
        let result = '';
        if (contentType === 'flashcard') {
            result = ROUTES.CLASS_TOPIC_WORKSPACE({ classId, topicId: parsedTopicId, tab: 'flashcard' });
        } else if (contentType === 'mindmap') {
            result = ROUTES.MINDMAP_VIEW(topicId);
        } else if (contentType === 'quiz') {
            result = ROUTES.CLASS_TOPIC_WORKSPACE({ classId, topicId: parsedTopicId, tab: 'quiz' });
        }
        return result;
    }

    public getSubtractedDate(createdDate: Date, currentDate: Date): ISubtractedDate {
        const minutesAgo = differenceInMinutes(currentDate, createdDate);
        const hoursAgo = differenceInHours(currentDate, createdDate);
        const sameDay = isSameDay(currentDate, createdDate);
        const sameWeek = isSameWeek(currentDate, createdDate);
        const sameMonth = isSameMonth(currentDate, createdDate);
        if (minutesAgo < 60) {
            return { unit: TimeUnit.MINUTE, unitAgo: minutesAgo };
        }
        if (sameDay) {
            return { unit: TimeUnit.DAY, unitAgo: hoursAgo };
        }
        if (sameWeek) {
            return { unit: TimeUnit.WEEK };
        }
        if (sameMonth) {
            return { unit: TimeUnit.MONTH };
        }
        return { unit: 'longTimeAgo' };
    }

    public getFeedGroups(feeds: IClassFeed[]) {
        const map = new Map<IAllowedTimeUnit, IFeedGroup[]>();
        const currentDate = getCurrentSystemDateTime();
        for (const feed of feeds) {
            const sub = this.getSubtractedDate(parseISOToLocalDate(feed.createdAt)!, currentDate);
            const currentFeeds = map.get(sub.unit);
            if (!currentFeeds) {
                map.set(sub.unit, [{ feed, group: sub }]);
            } else {
                currentFeeds.push({ feed, group: sub });
            }
        }
        return map;
    }
}

export default new FeedHelper();
export const unitOrder = [TimeUnit.MINUTE, TimeUnit.DAY, TimeUnit.HOUR, TimeUnit.WEEK, TimeUnit.MONTH, 'longTimeAgo'];
