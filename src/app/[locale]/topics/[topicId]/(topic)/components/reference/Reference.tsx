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

    const rawContent =
        typeof item.originContent?.content === 'string'
            ? item.originContent.content
            : JSON.stringify(item.originContent?.content);

    const defaultLengthConcat = 240;
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
            <div className="px-2">
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <svg
                                className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
                            <p
                                className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed cursor-pointer hover:opacity-70"
                                onClick={handleReferenceOriginContent}
                            >
                                {displayText}
                            </p>
                            {timestamp && (
                                <span
                                    className="inline-block mt-2 text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
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
        <div className="relative rounded-xl border border-border bg-card text-card-foreground p-5 md:p-6 shadow-sm">
            <div className="px-2">
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <svg
                                className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
                            <p
                                className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed cursor-pointer hover:opacity-70"
                                onClick={handleReferenceOriginContent}
                            >
                                {displayText}
                            </p>

                            {rawContent.length > 240 && (
                                <div className="mt-2">
                                    <button
                                        onClick={() => setExpanded((e) => !e)}
                                        className="text-xs underline decoration-dotted text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                    >
                                        {expanded ? t('showLess') : t('showMore')}
                                    </button>
                                </div>
                            )}

                            {timestamp && (
                                <span
                                    className="inline-block mt-2 text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
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
            <div className="text-center">
                <div
                    className="flex flex-col items-center gap-3 cursor-pointer hover:opacity-65"
                    onClick={handleReferenceOriginContent}
                >
                    {pageNumber > 0 && (
                        <span
                            className="text-[14px] px-3 py-1.5 rounded-full bg-secondary text-muted-foreground font-medium hover:bg-opacity-70"
                            title={t('pageNumberTitle')}
                        >
                            {t('page', { pageNumber })}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="relative rounded-xl border border-border bg-card text-card-foreground p-5 md:p-6 shadow-sm">
            <div className="px-2">
                <div className="text-center">
                    <div
                        className="flex flex-col items-center gap-3 cursor-pointer hover:opacity-65"
                        onClick={handleReferenceOriginContent}
                    >
                        {pageNumber > 0 && (
                            <span
                                className="text-[14px] px-3 py-1.5 rounded-full bg-secondary text-muted-foreground font-medium hover:bg-slate-600"
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
                    <span className="text-[10px] px-2 py-1 rounded bg-muted border border-border text-muted-foreground">
                        {item.contentType}
                    </span>
                </div>
            </div>
        </div>
    );
}
