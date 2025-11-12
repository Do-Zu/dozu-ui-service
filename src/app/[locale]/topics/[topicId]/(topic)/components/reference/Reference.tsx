'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { X } from 'lucide-react';
import { embeddingService } from '../../service/embedding.service';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';

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

export default function Reference({ content, triggerClassName = '', children }: IProps) {
    const { learningMaterial } = useTopicWorkspace();
    const params = useParams();
    const topicIdRaw = params?.topicId;
    const topicId =
        typeof topicIdRaw === 'string' ? Number(topicIdRaw) : Array.isArray(topicIdRaw) ? Number(topicIdRaw[0]) : NaN;

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<IReturnItemQuery[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [queried, setQueried] = useState(false); // avoid re-fetch on every open unless refresh
    const abortedRef = useRef(false);

    const fetchData = useCallback(async () => {
        if (!content || !topicId || isNaN(topicId)) return;
        setLoading(true);
        setError(null);
        abortedRef.current = false;
        try {
            console.log({ learningMaterial });
            const res = (await embeddingService.queryTopSimilarity({
                type: learningMaterial?.type ?? 'unknown',
                query: content,
                topicId,
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
    }, [content, topicId]);

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
        <span onClick={() => setOpen(true)} className="inline-block cursor-pointer">
            {children}
        </span>
    ) : (
        <button
            type="button"
            onClick={() => setOpen(true)}
            className={`mt-3 text-xs underline decoration-dashed decoration-neutral-400 hover:text-primary transition-colors ${triggerClassName}`}
            aria-haspopup="dialog"
        >
            View references
        </button>
    );

    return (
        <>
            {trigger}
            {open && (
                <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                        aria-label="Close references overlay"
                    />
                    {/* Modal */}
                    <div className="relative z-10 w-full max-w-3xl mx-4 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border dark:border-neutral-700 max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b dark:border-neutral-700">
                            <h2 className="text-sm font-semibold">Nearest Reference Content</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fetchData()}
                                    disabled={loading}
                                    className="text-xs px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:opacity-50"
                                >
                                    {loading ? 'Loading…' : 'Refresh'}
                                </button>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto p-5 space-y-4">
                            {/* Original reference text */}
                            <div className="p-3 rounded border dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                                <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Reference Query</p>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                            </div>

                            {loading && (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin h-6 w-6 rounded-full border-2 border-neutral-400 border-t-transparent" />
                                </div>
                            )}

                            {error && !loading && (
                                <div className="p-4 rounded border border-red-300 bg-red-50 dark:bg-red-900/30 dark:border-red-700">
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
                                <p className="text-sm text-neutral-500">No related references found.</p>
                            )}

                            {!loading &&
                                !error &&
                                results.map((item) => <ReferenceItem key={item.embeddingId} item={item} />)}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t dark:border-neutral-700 flex justify-end">
                            <button
                                onClick={() => setOpen(false)}
                                className="text-xs px-3 py-1.5 rounded bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
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

    const timestamp = item.metadata && 'startTime' in item.metadata ? formatSeconds(item.metadata.startTime) : '';

    return (
        <div className="group border dark:border-neutral-700 rounded-md p-3 bg-white dark:bg-neutral-900 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayText}</p>
                    {rawContent.length > 240 && (
                        <button
                            onClick={() => setExpanded((e) => !e)}
                            className="mt-1 text-xs underline decoration-dotted text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        >
                            {expanded ? 'Show less' : 'Show more'}
                        </button>
                    )}
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span
                        className="text-[10px] font-medium px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                        title="Similarity score"
                    >
                        {(item.similarity * 100).toFixed(1)}%
                    </span>
                    {timestamp && (
                        <span
                            className="text-[10px] px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                            title="Start time"
                        >
                            {timestamp}
                        </span>
                    )}
                </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] px-2 py-1 rounded bg-neutral-50 dark:bg-neutral-800 border dark:border-neutral-700 text-neutral-500">
                    {item.contentType}
                </span>
                <span className="text-[10px] text-neutral-400">#{item.embeddingId}</span>
            </div>
        </div>
    );
}
