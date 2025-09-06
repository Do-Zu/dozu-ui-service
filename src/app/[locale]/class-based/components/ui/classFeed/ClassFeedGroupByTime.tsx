import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TimeUnit } from '@/utils/date/date.util';
import { IClassFeed } from '../../../types/classFeed.type';
import { useEffect, useState } from 'react';
import feedHelper, { IAllowedTimeUnit, unitOrder } from '@/utils/feeds/feed.helper';

interface FeedGroupProps {
    feeds: IClassFeed[];
    renderFeedCard: (feed: IClassFeed) => React.ReactNode;
}

export default function ClassFeedGroupedByTime({ feeds, renderFeedCard }: FeedGroupProps) {
    const [feedGroups, setFeedGroups] = useState<Map<IAllowedTimeUnit, IClassFeed[]>>();

    useEffect(() => {
        setFeedGroups(feedHelper.getFeedGroups(feeds));
    }, [feeds]);

    if (!feedGroups) {
        return <div>No Feed Groups</div>;
    }

    return (
        <div className="space-y-6">
            {unitOrder.map((unit) =>
                feedGroups.get(unit) ? (
                    <Card key={unit} className="shadow-sm border border-border">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-semibold text-foreground">
                                {feedHelper.getGroupLabel(unit)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {feedGroups.get(unit)!.map((feed) => renderFeedCard(feed))}
                        </CardContent>
                    </Card>
                ) : null,
            )}
        </div>
    );
}
