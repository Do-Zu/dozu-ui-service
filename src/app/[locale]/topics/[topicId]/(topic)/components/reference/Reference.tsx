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
import { formatSeconds, safeDestructure, truncate } from '@/utils';
import DataStatus from '@/components/errors/DataStatus';

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
            View references
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
            More
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
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && results?.length === 0 && queried && (
                <p className="mt-4 text-sm text-neutral-500">No related references found.</p>
            )}

            <ScrollArea>
                <div className="mt-4 max-h-[62vh] pr-1 space-y-4 bg-background/50 rounded-md p-4">
                    {!loading &&
                        !error &&
                        results?.map((item) => <ReferenceItem key={item.embeddingId} item={item} isShowMore={true} />)}
                </div>
            </ScrollArea>
        </div>
    );

    const Footer = <div className="flex w-full justify-end gap-2"></div>;

    const Cancel = (
        <Button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 rounded ">
            Close
        </Button>
    );

    if (!results) {
        return trigger;
    }

    if (!isShowMore) {
        if (learningMaterial?.type === 'file') {
            return (
                <div className="mt-4">
                    <FileReferenceItem item={results?.[0]} isShowMore={isShowMore} />
                    {triggerShowMore}
                </div>
            );
        } else if (learningMaterial?.type === 'youtube') {
            return (
                <div className="mt-4">
                    <YouTubeReferenceItem item={results?.[0]} isShowMore={isShowMore} />
                    {triggerShowMore}
                </div>
            );
        }

        return <DataStatus variant="empty" />;
    }

    if (learningMaterial?.type && isShowMore)
        return (
            <Modal
                isOpen={open}
                setIsOpen={() => {
                    setOpen((prev) => !prev);
                    setIsShowMore((prev) => !prev);
                }}
                trigger={trigger}
                title="Nearest Reference Content"
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
}

function ReferenceItem({ item, isShowMore = true }: ReferenceItemProps) {
    const { learningMaterial } = useTopicWorkspace();

    if (learningMaterial?.type === 'file') {
        return <FileReferenceItem item={item} isShowMore={isShowMore} />;
    } else if (learningMaterial?.type === 'youtube') {
        return <YouTubeReferenceItem item={item} isShowMore={isShowMore} />;
    }

    return <DataStatus variant="empty" />;
}

function YouTubeReferenceItem({ item, isShowMore }: ReferenceItemProps) {
    const [expanded, setExpanded] = useState(false);

    const rawContent =
        typeof item.originContent?.content === 'string'
            ? item.originContent.content
            : JSON.stringify(item.originContent?.content);

    const defaultLengthConcat = 240;
    const displayText = expanded ? rawContent : truncate(rawContent, defaultLengthConcat);

    const timestamp = item?.metadata && 'startTime' in item.metadata ? formatSeconds(item?.metadata?.startTime) : '';

    const handleReferenceOriginContent = () => {
        toast({
            description: 'Coming Soon',
        });
    };

    if (!isShowMore) {
        return (
            <div className="px-2">
                <div className="text-center">
                    <p
                        className="text-base md:text-[20px] text-center leading-relaxed whitespace-pre-wrap mb-2 cursor-pointer hover:opacity-65"
                        onClick={handleReferenceOriginContent}
                    >
                        {displayText}...
                    </p>

                    {rawContent.length > 240 && (
                        <div className="mt-2 text-center mb-2">
                            <Button
                                onClick={() => setExpanded((e) => !e)}
                                className="text-xs underline decoration-dotted text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            >
                                {expanded ? 'Show less' : 'Show more'}
                            </Button>
                        </div>
                    )}

                    {timestamp && (
                        <span
                            className="text-[14px] px-2 py-1 rounded bg-secondary text-muted-foreground mt-4 cursor-pointer hover:bg-slate-600"
                            title="Start time"
                            onClick={handleReferenceOriginContent}
                        >
                            {timestamp}
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
                    <p
                        className="text-base md:text-[20px] text-center leading-relaxed whitespace-pre-wrap mb-2 cursor-pointer hover:opacity-65"
                        onClick={handleReferenceOriginContent}
                    >
                        {displayText}...
                    </p>

                    {rawContent.length > 240 && (
                        <div className="mt-2 text-center mb-2">
                            <Button
                                onClick={() => setExpanded((e) => !e)}
                                className="text-xs underline decoration-dotted text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            >
                                {expanded ? 'Show less' : 'Show more'}
                            </Button>
                        </div>
                    )}

                    {timestamp && (
                        <span
                            className="text-[14px] px-2 py-1 rounded bg-secondary text-muted-foreground mt-4 cursor-pointer hover:bg-slate-600"
                            title="Start time"
                            onClick={handleReferenceOriginContent}
                        >
                            {timestamp}
                        </span>
                    )}
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

function FileReferenceItem({ item, isShowMore }: ReferenceItemProps) {
    const { setPageNumber } = useTopicWorkspace();

    const { pageNumber } = safeDestructure(item?.metadata as MetaDataFileContent, {
        pageNumber: -1,
    });

    const handleReferenceOriginContent = () => {
        if (pageNumber > 0) {
            setPageNumber(pageNumber);
        } else {
            toast({
                description: 'Page invalid',
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
                            title="Page number"
                        >
                            Page {pageNumber}
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
                                title="Page number"
                            >
                                Page {pageNumber}
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
