'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Modal } from '@/components/modal/Modal';
import { embeddingService, IQuerySimilarity, IResponseQuery } from '../../service/embedding.service';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import usePost from '@/hooks/usePost';
import { formatSeconds, isEmpty, isNilOrEmpty, safeDestructure, toNumber, truncate } from '@/utils';
import DataStatus from '@/components/errors/DataStatus';
import { useTranslations } from 'next-intl';

interface IProps {
    content: string;
    triggerClassName?: string;
    children?: React.ReactNode;
    className?: string;
}

/* Types mirrored from embedding.service.ts */
type TypeMetaDataChunkEmbed = {
    type: string;
    content: string | number | object | Array<unknown>;
};

export type MetaDataYoutubeContent = { startTime: number };

export type MetaDataFileContent = {
    pageNumber: number;
};
interface IReturnItemQuery {
    embeddingId: number;
    topicId: number;
    contentType: string;
    originContent: TypeMetaDataChunkEmbed;
    metadata: MetaDataYoutubeContent | MetaDataFileContent | null;
    createdAt: string | Date;
    similarity: number;
}

const getSimilarityStyles = (s?: number) => {
    if (s == null) {
        return {
            card: 'border-slate-200 bg-slate-100/70 dark:border-slate-700/70 dark:bg-slate-900/40',
            badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
        };
    }

    if (s < 0.4) {
        return {
            card: 'border-rose-200 bg-rose-300/50 dark:border-rose-900/60 dark:bg-rose-800/20',
            badge: 'bg-rose-500/10 text-rose-700 border border-rose-200/70 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-700/70',
        };
    }

    if (s >= 0.4 && s <= 0.5) {
        return {
            card: 'border-amber-200 bg-amber-100/70 dark:border-amber-900/50 dark:bg-amber-950/30',
            badge: 'bg-amber-500/10 text-amber-700 border border-amber-200/70 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-700/70',
        };
    }

    if (s > 0.5 && s <= 0.65) {
        return {
            card: 'border-sky-200 bg-sky-200/50 dark:border-sky-900/60 dark:bg-sky-950/40',
            badge: 'bg-sky-500/10 text-sky-700 border border-sky-200/70 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-700/70',
        };
    }

    return {
        card: 'border-emerald-200 bg-emerald-100/70 dark:border-emerald-900/60 dark:bg-emerald-950/30',
        badge: 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-700/70',
    };
};

export default function Reference({ content, triggerClassName = '', className, children }: IProps) {
    const t = useTranslations('topic.reference');
    const { learningMaterial } = useTopicWorkspace();

    const params = useParams();
    const topicIdRaw = params?.topicId;
    const topicId =
        typeof topicIdRaw === 'string' ? Number(topicIdRaw) : Array.isArray(topicIdRaw) ? Number(topicIdRaw[0]) : NaN;

    const [open, setOpen] = useState(false);
    const [isShowMore, setIsShowMore] = useState(false);

    const [queried, setQueried] = useState(false);
    const {
        data: results,
        error,
        loading,
        execute,
        reset,
    } = usePost<IQuerySimilarity, IReturnItemQuery[]>(
        async (payload) => await embeddingService.queryTopSimilarity(payload),
        'POST',
        {
            onMessageSuccess() {
                setQueried(true);
            },
        },
    );

    // Map learning material type to supported embedding input type
    const mapEmbeddingType = (t?: string): 'text' | 'file' | 'youtube' => {
        if (t === 'youtube') return 'youtube';
        if (t === 'file') return 'file';
        return 'text';
    };

    const fetchData = useCallback(async () => {
        if (!content || !topicId || isNaN(topicId)) return;

        try {
            await execute({
                type: mapEmbeddingType(learningMaterial?.type),
                query: content,
                topicId,
            });
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.log(error);
            }
        }
    }, [content, topicId, learningMaterial?.type]);

    useEffect(() => {
        if (content && queried) {
            setQueried(false);
        }
    }, [content]);

    useEffect(() => {
        setQueried(false);
        setOpen(false);
        setIsShowMore(false);
        if (reset) reset();
    }, [content, reset]);

    if (!topicId || isNaN(topicId)) {
        return <DataStatus variant="empty" />;
    }

    const trigger = children ? (
        <span className="inline-block cursor-pointer">{children}</span>
    ) : (
        <button
            type="button"
            className={`mt-3 text-xs underline decoration-dashed decoration-neutral-400 hover:text-primary transition-colors ${triggerClassName}`}
            onClick={fetchData}
        >
            {t('trigger')}
        </button>
    );

    const triggerShowMore = (
        <button
            type="button"
            className={`mt-2 text-xs underline decoration-dashed decoration-neutral-400 hover:text-primary transition-colors ${triggerClassName}`}
            onClick={() => {
                setIsShowMore(true);
                setOpen(true);
            }}
        >
            {t('more')}
        </button>
    );

    // Modal body with its own scroll container to prevent layout overflow
    const Body = (
        <div className="mt-4">
            <div className="p-3 rounded border border-border bg-muted text-foreground/90">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
            </div>

            {loading && (
                <div className="flex justify-center py-10">
                    <div className="animate-spin h-6 w-6 rounded-full border-2 border-neutral-400 border-t-transparent" />
                </div>
            )}

            {error && !loading && (
                <div className="mt-4 p-4 rounded border border-red-300 bg-red-50 dark:bg-red-900/30 dark:border-red-700">
                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">{error}</p>
                    <button
                        onClick={() => fetchData()}
                        className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500"
                    >
                        {t('retry')}
                    </button>
                </div>
            )}

            {!loading && !error && results?.length === 0 && queried && (
                <p className="mt-4 text-sm text-neutral-500">{t('noResults')}</p>
            )}

            <ScrollArea>
                <div className="mt-4 max-h-[62vh] pr-1 space-y-4 bg-background/50 rounded-md p-4">
                    {!loading &&
                        !error &&
                        results?.map((item) => (
                            <ReferenceItem
                                key={item.embeddingId}
                                item={item}
                                isShowMore={true}
                                onClose={() => {
                                    setOpen(false);
                                    setIsShowMore(false);
                                }}
                            />
                        ))}
                </div>
            </ScrollArea>
        </div>
    );

    const Footer = <div className="flex w-full justify-end gap-2"></div>;

    const Cancel = (
        <Button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 rounded ">
            {t('close')}
        </Button>
    );

    if (!results) {
        return trigger;
    }

    if (!isShowMore && isEmpty(results)) return <DataStatus variant="empty" />;

    if (!isShowMore) {
        const highestResultSuggest = results[0];

        if (learningMaterial?.type === 'file') {
            return (
                <div className="mt-4">
                    <FileReferenceItem item={highestResultSuggest} isShowMore={isShowMore} onClose={() => {}} />
                    {triggerShowMore}
                </div>
            );
        } else if (learningMaterial?.type === 'youtube') {
            return (
                <div className="mt-4">
                    <YouTubeReferenceItem item={highestResultSuggest} isShowMore={isShowMore} onClose={() => {}} />
                    {triggerShowMore}
                </div>
            );
        }

        return <DataStatus variant="error" title={t('contentTypeInvalid')} />;
    }

    return (
        <Modal
            isOpen={open}
            setIsOpen={() => {
                setOpen((prev) => !prev);
                setIsShowMore((prev) => !prev);
            }}
            trigger={trigger}
            title={t('modalTitle')}
            description={null}
            body={Body}
            footer={Footer}
            cancel={Cancel}
            contentStyle={`w-[92vw] max-w-[960px] md:max-w-[1000px] lg:max-w-[1100px] max-h-[88vh] p-5 ${className}`}
        />
    );
}

interface ReferenceItemProps {
    item: IReturnItemQuery;
    isShowMore: boolean;
    onClose: () => void;
}

function ReferenceItem({ item, isShowMore = true, onClose }: ReferenceItemProps) {
    const { learningMaterial } = useTopicWorkspace();

    if (learningMaterial?.type === 'file') {
        return <FileReferenceItem item={item} isShowMore={isShowMore} onClose={onClose} />;
    } else if (learningMaterial?.type === 'youtube') {
        return <YouTubeReferenceItem item={item} isShowMore={isShowMore} onClose={onClose} />;
    }

    return <DataStatus variant="empty" />;
}

function YouTubeReferenceItem({ item, isShowMore, onClose }: ReferenceItemProps) {
    const t = useTranslations('topic.reference');
    const { seekTo } = useTopicWorkspace();
    const [expanded, setExpanded] = useState(false);

    const { similarity } = safeDestructure(item);

    const similarityStyles = getSimilarityStyles(similarity);

    const rawContent =
        typeof item.originContent?.content === 'string'
            ? item.originContent.content
            : JSON.stringify(item.originContent?.content);

    const defaultLengthConcat = 100;

    const displayText = expanded ? rawContent : truncate(rawContent, defaultLengthConcat);

    const { startTime } = safeDestructure(item?.metadata as MetaDataYoutubeContent, {
        startTime: -1,
    });

    const timestamp = startTime >= 0 ? formatSeconds(startTime) : 'N/A';

    const handleReferenceOriginContent = () => {
        onClose();

        const seconds = toNumber(startTime);

        if (seconds !== null && seconds != undefined && seconds >= 0) {
            seekTo(seconds);
        }
    };

    if (!isShowMore) {
        return (
            <div className="px-2 relative">
                <div className={`rounded-lg p-4 transition-colors ${similarityStyles.card}`}>
                    <div className="">
                        <div className="flex-shrink-0">
                            <p className="text-sm text-slate-900 dark:text-slate-50 leading-relaxed hover:opacity-80">
                                {displayText}
                            </p>
                        </div>

                        <div className="flex-1">
                            <div className="">
                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full shadow-sm ${similarityStyles.badge}`}
                                >
                                    similarity: {similarity?.toFixed(2) ?? '--'}
                                </span>
                            </div>
                            {timestamp && (
                                <span
                                    className="inline-block mt-2 text-xs px-2 py-1 rounded bg-sky-100/80 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 cursor-pointer hover:bg-sky-200/90 dark:hover:bg-sky-800/80"
                                    title={t('startTime')}
                                    onClick={handleReferenceOriginContent}
                                >
                                    {timestamp}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative rounded-xl border bg-card text-card-foreground p-5 md:p-6 shadow-sm transition-colors ${similarityStyles.card}`}
        >
            {/* similarity score badge */}
            <div className="absolute right-4 top-3">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full shadow-sm ${similarityStyles.badge}`}>
                    similarity: {similarity?.toFixed(2) ?? '--'}
                </span>
            </div>

            <div className="px-2">
                <div className="rounded-lg p-4 border border-transparent/0">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <svg
                                className="w-5 h-5 text-sky-600 dark:text-sky-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-900 dark:text-slate-50 leading-relaxed hover:opacity-80">
                                {displayText}
                            </p>

                            {rawContent.length > defaultLengthConcat && (
                                <div className="mt-2">
                                    <button
                                        onClick={() => setExpanded((e) => !e)}
                                        className="text-xs underline decoration-dotted text-sky-700 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-200"
                                    >
                                        {expanded ? t('showLess') : t('showMore')}
                                    </button>
                                </div>
                            )}

                            {timestamp && (
                                <span
                                    className="inline-block mt-2 text-xs px-2 py-1 rounded bg-sky-100/80 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 cursor-pointer hover:bg-sky-200/90 dark:hover:bg-sky-800/80"
                                    title={t('startTime')}
                                    onClick={handleReferenceOriginContent}
                                >
                                    {timestamp}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FileReferenceItem({ item, isShowMore, onClose }: ReferenceItemProps) {
    const t = useTranslations('topic.reference');
    const { setPageNumber } = useTopicWorkspace();

    const { similarity } = safeDestructure(item);

    const similarityStyles = getSimilarityStyles(similarity);

    const { pageNumber } = safeDestructure(item?.metadata as MetaDataFileContent, {
        pageNumber: -1,
    });

    const handleReferenceOriginContent = () => {
        onClose();
        if (pageNumber > 0) {
            setPageNumber(pageNumber);
        } else {
            toast({
                description: t('pageInvalid'),
            });
        }
    };

    if (!isShowMore) {
        return (
            <div>
                <button
                    type="button"
                    onClick={handleReferenceOriginContent}
                    className={`relative inline-flex flex-col items-center justify-center rounded-xl px-5 py-3 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-[1px] ${similarityStyles.card}`}
                >
                    {pageNumber > 0 && (
                        <span
                            className="mt-1 text-sm md:text-[15px] font-semibold text-slate-50 tracking-tight"
                            title={t('pageNumberTitle')}
                        >
                            {t('page', { pageNumber })}
                        </span>
                    )}

                    <span
                        className={`mt-5 px-3 py-0.5 text-[11px] leading-none rounded-full shadow-sm border ${similarityStyles.badge}`}
                    >
                        similarity: {similarity?.toFixed(2) ?? '--'}
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div
            className={`relative rounded-xl border bg-card text-card-foreground p-5 md:p-6 shadow-sm transition-colors ${similarityStyles.card}`}
        >
            {/* similarity badge */}
            <div className="absolute right-4 top-3">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full shadow-sm ${similarityStyles.badge}`}>
                    similarity {similarity?.toFixed(2) ?? '--'}
                </span>
            </div>

            <div className="px-2">
                <div className="text-center">
                    <div
                        className="flex flex-col items-center gap-3 cursor-pointer hover:opacity-80"
                        onClick={handleReferenceOriginContent}
                    >
                        {pageNumber > 0 && (
                            <span
                                className="text-sm px-3 py-1.5 rounded-full bg-slate-900/5 text-slate-700 dark:bg-slate-50/10 dark:text-slate-100 font-medium"
                                title={t('pageNumberTitle')}
                            >
                                {t('page', { pageNumber })}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-1 rounded bg-slate-900/5 border border-border text-muted-foreground">
                        {item.contentType}
                    </span>
                </div>
            </div>
        </div>
    );
}
