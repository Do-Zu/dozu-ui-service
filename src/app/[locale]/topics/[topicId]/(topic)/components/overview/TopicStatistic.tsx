'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Award, BookCheck, Layers3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils';
import { useRequireTopic } from '../../context/useRequireTopic';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const CHART_VIEWBOX_WIDTH = 100;
const CHART_VIEWBOX_HEIGHT = 60;
const CHART_PADDING = 6;

type ChartPoint = {
    x: number;
    y: number;
    reviewCount: number;
};

type ChartData = {
    points: ChartPoint[];
    hasData: boolean;
};

const defaultChartPoints: ChartPoint[] = [
    { x: 6, y: 12, reviewCount: 0 },
    { x: 30, y: 22, reviewCount: 0 },
    { x: 54, y: 30, reviewCount: 0 },
    { x: 78, y: 38, reviewCount: 0 },
    { x: 94, y: 44, reviewCount: 0 },
];

function toValidDate(value?: string | Date | null) {
    if (!value) {
        return null;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return parsedDate;
}

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildChartPath(points: ChartPoint[]) {
    if (points.length === 0) {
        return '';
    }

    return points.reduce((path, point, index) => {
        if (index === 0) {
            return `M ${point.x} ${point.y}`;
        }

        return `${path} L ${point.x} ${point.y}`;
    }, '');
}

function buildAreaPath(points: ChartPoint[]) {
    if (points.length === 0) {
        return '';
    }

    const linePath = buildChartPath(points);
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];

    return `${linePath} L ${lastPoint.x} ${CHART_VIEWBOX_HEIGHT - CHART_PADDING} L ${firstPoint.x} ${
        CHART_VIEWBOX_HEIGHT - CHART_PADDING
    } Z`;
}

function buildRetentionChartData(upcomingReviewDayCounts: Record<number, number>, totalItems: number): ChartData {
    if (totalItems === 0) {
        return { points: defaultChartPoints, hasData: false };
    }

    const today = startOfDay(new Date());
    const todayTimestamp = today.getTime();
    const sortedReviewDays = Object.keys(upcomingReviewDayCounts)
        .map((value) => Number(value))
        .filter((timestamp) => timestamp >= todayTimestamp)
        .sort((a, b) => a - b);

    const chartDayTimestamps = [todayTimestamp, ...sortedReviewDays.filter((timestamp) => timestamp > todayTimestamp)];
    const trimmedDayTimestamps = chartDayTimestamps.slice(0, 6);

    if (trimmedDayTimestamps.length === 1) {
        trimmedDayTimestamps.push(todayTimestamp + MILLISECONDS_PER_DAY * 2);
        trimmedDayTimestamps.push(todayTimestamp + MILLISECONDS_PER_DAY * 5);
        trimmedDayTimestamps.push(todayTimestamp + MILLISECONDS_PER_DAY * 10);
    }

    const strengthValues = trimmedDayTimestamps.map((timestamp, index) => {
        if (index === 0) {
            return 100;
        }

        const dayOffset = Math.max(1, Math.round((timestamp - todayTimestamp) / MILLISECONDS_PER_DAY));
        const baseDecay = Math.min(55, dayOffset * 8);
        const baseStrength = Math.max(32, 100 - baseDecay);
        const reviewCount = upcomingReviewDayCounts[timestamp] ?? 0;
        const reviewRatio = reviewCount / totalItems;
        const reviewBoost = Math.min(35, reviewRatio * 60);

        return Math.min(100, baseStrength + reviewBoost);
    });

    const xStep = (CHART_VIEWBOX_WIDTH - CHART_PADDING * 2) / (strengthValues.length - 1 || 1);

    const points = strengthValues.map((strength, index) => {
        const xValue = CHART_PADDING + xStep * index;
        const normalizedStrength = Math.min(100, Math.max(0, strength));
        const yValue = CHART_PADDING + (1 - normalizedStrength / 100) * (CHART_VIEWBOX_HEIGHT - CHART_PADDING * 2);

        return {
            x: Number(xValue.toFixed(2)),
            y: Number(yValue.toFixed(2)),
            reviewCount: upcomingReviewDayCounts[trimmedDayTimestamps[index]] ?? 0,
        } satisfies ChartPoint;
    });

    return { points, hasData: true };
}

interface StatisticBadgeProps {
    label: string;
    value: number;
}

function StatisticBadge({ label, value }: StatisticBadgeProps) {
    return (
        <Card className="border-border/60">
            <CardContent className="space-y-2 p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold text-foreground">{value}</p>
            </CardContent>
        </Card>
    );
}

interface AchievementItemProps {
    icon: React.ReactNode;
    label: string;
    value: number;
}

function AchievementItem({ icon, label, value }: AchievementItemProps) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">{icon}</span>
                <span>{label}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{value}</span>
        </div>
    );
}

export default function TopicStatistic() {
    const tTopic = useTranslations('topic');
    const { topic } = useRequireTopic();

    const statistics = useMemo(() => {
        const now = new Date();
        const itemTrackings = topic.itemTrackings ?? [];

        const statusCounts = {
            total: itemTrackings.length,
            newCount: 0,
            learningCount: 0,
            reviewingCount: 0,
            masteredCount: 0,
            readyToReviewCount: 0,
            reviewedCount: 0,
        };

        const upcomingReviewDayCounts: Record<number, number> = {};
        let reviewIntervalSum = 0;
        let reviewIntervalCount = 0;

        itemTrackings.forEach((item) => {
            const statusValue = item.status?.toLowerCase?.() ?? '';
            if (statusValue === 'new') {
                statusCounts.newCount += 1;
            } else if (statusValue === 'learning') {
                statusCounts.learningCount += 1;
            } else if (statusValue === 'review' || statusValue === 'reviewing') {
                statusCounts.reviewingCount += 1;
            } else if (statusValue === 'mastered') {
                statusCounts.masteredCount += 1;
            }

            if (item.reviewInterval && item.reviewInterval > 0) {
                reviewIntervalSum += item.reviewInterval;
                reviewIntervalCount += 1;
            }

            const lastReviewedDate = toValidDate(item.lastReviewed);
            if (lastReviewedDate) {
                statusCounts.reviewedCount += 1;
            }

            const nextReviewDate = toValidDate(item.nextReview);
            if (nextReviewDate) {
                const reviewDay = startOfDay(nextReviewDate).getTime();
                upcomingReviewDayCounts[reviewDay] = (upcomingReviewDayCounts[reviewDay] ?? 0) + 1;

                if (nextReviewDate <= now) {
                    statusCounts.readyToReviewCount += 1;
                }
            }
        });

        const averageReviewInterval = reviewIntervalCount > 0 ? Math.round(reviewIntervalSum / reviewIntervalCount) : 0;
        const upcomingReviewDates = Object.keys(upcomingReviewDayCounts)
            .map((value) => Number(value))
            .filter((timestamp) => !Number.isNaN(timestamp))
            .sort((a, b) => b - a);
        const estimatedMasteryDate = upcomingReviewDates.length > 0 ? new Date(upcomingReviewDates[0]) : null;
        const chartData = buildRetentionChartData(upcomingReviewDayCounts, statusCounts.total);

        return {
            statusCounts,
            averageReviewInterval,
            estimatedMasteryDate,
            chartData,
        };
    }, [topic.itemTrackings]);

    const { statusCounts, averageReviewInterval, estimatedMasteryDate, chartData } = statistics;
    const totalItems = statusCounts.total;
    const chartLinePath = buildChartPath(chartData.points);
    const chartAreaPath = buildAreaPath(chartData.points);

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <Card className="border-border/60">
                    <CardHeader className="space-y-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>{tTopic('overview.retentionTitle')}</CardTitle>
                                <p className="text-sm text-muted-foreground">{tTopic('overview.retentionSubtitle')}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-6 rounded-full bg-primary/60" />
                                    {tTopic('overview.retentionStrength')}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-primary" />
                                    {tTopic('overview.reviewPoints')}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {totalItems === 0 ? (
                            <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground">
                                {tTopic('overview.noTracking')}
                            </div>
                        ) : (
                            <div className="relative h-56 w-full rounded-lg border border-border/60 bg-muted/20">
                                <svg
                                    className="absolute inset-0 size-full"
                                    viewBox={`0 0 ${CHART_VIEWBOX_WIDTH} ${CHART_VIEWBOX_HEIGHT}`}
                                    preserveAspectRatio="none"
                                >
                                    <defs>
                                        <linearGradient id="retentionArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d={chartAreaPath} fill="url(#retentionArea)" />
                                    <path d={chartLinePath} className="stroke-primary" strokeWidth="2" fill="none" />
                                    {chartData.points.map((point, index) => (
                                        <circle
                                            key={`${point.x}-${index}`}
                                            cx={point.x}
                                            cy={point.y}
                                            r={point.reviewCount > 0 ? 2.4 : 1.6}
                                            className={cn('fill-primary', point.reviewCount === 0 && 'opacity-60')}
                                        />
                                    ))}
                                </svg>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card className="border-border/60 bg-primary/10">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-base">{tTopic('overview.readyToReview')}</CardTitle>
                            <p className="text-xs text-muted-foreground">{tTopic('overview.scheduledByAlgorithm')}</p>
                        </CardHeader>
                        <CardContent className="flex items-baseline gap-2">
                            <span className="text-3xl font-semibold text-primary">
                                {statusCounts.readyToReviewCount}
                            </span>
                            <span className="text-sm text-muted-foreground">{tTopic('overview.items')}</span>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="text-base">{tTopic('overview.topicStats')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{tTopic('overview.currentStability')}</span>
                                <span className="font-semibold text-foreground">
                                    {averageReviewInterval > 0
                                        ? `${averageReviewInterval} ${tTopic('overview.days')}`
                                        : tTopic('overview.notAvailable')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{tTopic('overview.itemsInReview')}</span>
                                <span className="font-semibold text-foreground">{statusCounts.reviewingCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{tTopic('overview.estimatedMastery')}</span>
                                <span className="font-semibold text-foreground">
                                    {estimatedMasteryDate
                                        ? formatDate(estimatedMasteryDate)
                                        : tTopic('overview.notAvailable')}
                                </span>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    {tTopic('overview.achievements')}
                                </p>
                                <AchievementItem
                                    icon={<Award className="size-4" />}
                                    label={tTopic('overview.reviewedItems')}
                                    value={statusCounts.reviewedCount}
                                />
                                <AchievementItem
                                    icon={<BookCheck className="size-4" />}
                                    label={tTopic('overview.masteredItems')}
                                    value={statusCounts.masteredCount}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Layers3 className="size-4" />
                    <span className="font-medium">{tTopic('overview.distributionTitle')}</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatisticBadge label={tTopic('overview.newItems')} value={statusCounts.newCount} />
                    <StatisticBadge label={tTopic('overview.learningItems')} value={statusCounts.learningCount} />
                    <StatisticBadge label={tTopic('overview.reviewItems')} value={statusCounts.reviewingCount} />
                    <StatisticBadge label={tTopic('overview.masteredItems')} value={statusCounts.masteredCount} />
                </div>
            </div>
        </div>
    );
}
