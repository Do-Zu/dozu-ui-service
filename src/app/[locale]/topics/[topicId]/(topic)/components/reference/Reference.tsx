'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Modal } from '@/components/modal/Modal';
import { embeddingService } from '../../service/embedding.service';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface IProps {
    content: string;
    topK?: number;
    triggerClassName?: string;
    children?: React.ReactNode; // optional custom trigger
}

/* Types mirrored from embedding.service.ts */
type TypeMetaDataChunkEmbed = {
    type: string;
    content: string | number | object | Array<unknown>;
};

interface IReturnItemQuery {
    embeddingId: number;
    topicId: number;
    contentType: string;
    originContent: TypeMetaDataChunkEmbed;
    metadata: { startTime?: number } | null;
    createdAt: string | Date;
    similarity: number;
}

interface IEmbeddingResponse {
    status: string;
    message: string;
    code: number;
    data: IReturnItemQuery[];
}

/* Utility: format seconds -> HH:MM:SS */
function formatSeconds(sec?: number): string {
    if (sec == null || isNaN(sec)) return '';
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = Math.floor(sec % 60);
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    const s = seconds.toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

/* Truncate helper */
function truncate(str: string, max = 240) {
    if (str.length <= max) return str;
    return str.slice(0, max) + '…';
}

export default function Reference({ content, topK = 8, triggerClassName = '', children }: IProps) {
    const { learningMaterial } = useTopicWorkspace();

    const params = useParams();
    const topicIdRaw = params?.topicId;
    const topicId =
        typeof topicIdRaw === 'string' ? Number(topicIdRaw) : Array.isArray(topicIdRaw) ? Number(topicIdRaw[0]) : NaN;

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<IReturnItemQuery[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [queried, setQueried] = useState(false);
    const abortedRef = useRef(false);

    // Map learning material type to supported embedding input type
    const mapEmbeddingType = (t?: string): 'text' | 'file' | 'youtube' => {
        if (t === 'youtube') return 'youtube';
        if (t === 'file') return 'file';
        return 'text';
    };

    const fetchData = useCallback(async () => {
        if (!content || !topicId || isNaN(topicId)) return;
        setLoading(true);
        setError(null);
        abortedRef.current = false;
        try {
            const res = (await embeddingService.queryTopSimilarity({
                type: mapEmbeddingType(learningMaterial?.type),
                query: content,
                topicId,
                topK,
            })) as IEmbeddingResponse;

            if (abortedRef.current) return;

            if (res?.data) {
                setResults(res.data);
                setQueried(true);
            } else {
                setResults([]);
            }
        } catch (e: any) {
            if (abortedRef.current) return;
            setError(e?.message || 'Failed to load references');
        } finally {
            if (!abortedRef.current) setLoading(false);
        }
    }, [content, topicId, topK]);

    useEffect(() => {
        if (open && !queried) {
            fetchData();
        }
        return () => {
            abortedRef.current = true;
        };
    }, [open, queried, fetchData]);

    if (!topicId || isNaN(topicId)) {
        // If we cannot resolve topicId from route, silently do not render reference trigger.
        return null;
    }

    const trigger = children ? (
        <span className="inline-block cursor-pointer">{children}</span>
    ) : (
        <button
            type="button"
            className={`mt-3 text-xs underline decoration-dashed decoration-neutral-400 hover:text-primary transition-colors ${triggerClassName}`}
            aria-haspopup="dialog"
        >
            View references
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

            {!loading && !error && results.length === 0 && queried && (
                <p className="mt-4 text-sm text-neutral-500">No related references found.</p>
            )}

            <ScrollArea>
                <div className="mt-4 max-h-[62vh] pr-1 space-y-4 bg-background/50 rounded-md p-4">
                    {!loading && !error && results.map((item) => <ReferenceItem key={item.embeddingId} item={item} />)}
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

    return (
        <Modal
            isOpen={open}
            setIsOpen={setOpen}
            trigger={trigger as any}
            title="Nearest Reference Content"
            description={null}
            body={Body}
            footer={Footer}
            cancel={Cancel}
            contentStyle="w-[92vw] max-w-[960px] md:max-w-[1000px] lg:max-w-[1100px] max-h-[88vh] p-5"
        />
    );
}

interface ReferenceItemProps {
    item: IReturnItemQuery;
}

function ReferenceItem({ item }: ReferenceItemProps) {
    const [expanded, setExpanded] = useState(false);
    const rawContent =
        typeof item.originContent?.content === 'string'
            ? item.originContent.content
            : JSON.stringify(item.originContent?.content);
    const displayText = expanded ? rawContent : truncate(rawContent);

    const timestamp = item?.metadata && 'startTime' in item.metadata ? formatSeconds(item?.metadata?.startTime) : '';

    //TODO:
    const handleReferenceOriginContent = () => {
        toast({
            description: 'Coming Soon',
        });
    };
    return (
        <div className="relative rounded-xl border border-border bg-card text-card-foreground p-5 md:p-6 shadow-sm">
            {/* <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                <span
                    className="text-[10px] font-semibold px-2 py-1 rounded bg-secondary text-foreground/80"
                    title="Similarity score"
                >
                    {(item.similarity * 100).toFixed(1)}%
                </span>
            </div> */}

            <div className="px-2">
                <div className="text-center">
                    <p
                        className="text-base md:text-[20px] text-center leading-relaxed whitespace-pre-wrap mb-2 cursor-pointer hover:opacity-65"
                        onClick={handleReferenceOriginContent}
                    >
                        {displayText}
                    </p>
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

                {rawContent.length > 240 && (
                    <div className="mt-2 text-center">
                        <button
                            onClick={() => setExpanded((e) => !e)}
                            className="text-xs underline decoration-dotted text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        >
                            {expanded ? 'Show less' : 'Show more'}
                        </button>
                        {timestamp && (
                            <span
                                className="text-[14px] px-2 py-1 rounded bg-secondary text-muted-foreground"
                                title="Start time"
                            >
                                {timestamp}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-1 rounded bg-muted border border-border text-muted-foreground">
                        {item.contentType}
                    </span>
                    {/* FOR DEVELOPMENT */}
                    {/* <span className="text-[10px] text-muted-foreground/70">#{item.embeddingId}</span> */}
                </div>
            </div>
        </div>
    );
}
