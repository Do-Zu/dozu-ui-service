import { IClassFeed } from '../../../types/classFeed.type';
import { useEffect, useState } from 'react';
import feedHelper, { IAllowedTimeUnit, IFeedGroup, ISubtractedDate, unitOrder } from '@/utils/feeds/feed.helper';
import { useFeeds, useGroupLabel } from '@/app/[locale]/teacher/feeds/hooks/useFeeds';

interface FeedGroupProps {
    feeds: IClassFeed[];
    renderFeedCard: (feedGroup: IFeedGroup) => React.ReactNode;
}

export default function ClassFeedGroupedByTime({ feeds, renderFeedCard }: FeedGroupProps) {
    const [feedGroups, setFeedGroups] = useState<Map<string, IFeedGroup[]>>();
    const getGroupLabel = useGroupLabel();

    useEffect(() => {
        setFeedGroups(feedHelper.getFeedGroups(feeds));
    }, [feeds]);

    if (!feedGroups) {
        return <div>No Feed Groups</div>;
    }

    return (
        <div className="space-y-8">
            {unitOrder.map((unit) =>
                feedGroups.get(unit) ? (
                    <div key={unit} className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">{getGroupLabel(unit)}</h3>
                        <div className="space-y-4">
                            {feedGroups.get(unit)!.map((feedGroup) => renderFeedCard(feedGroup))}
                        </div>
                    </div>
                ) : null,
            )}
        </div>
    );
}
