'use client';

import React, { useCallback, useMemo } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import noteReferenceUtils from '../../utils/note-reference.utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IContentReference } from '../../types/note.type';

interface NoteSegmentRendererProps {
    htmlContent: string;
}

interface ParsedSegment {
    id: string;
    text: string;
    reference: IContentReference | null;
}

export default function NoteSegmentRenderer({ htmlContent }: NoteSegmentRendererProps) {
    const { seekTo } = useTopicWorkspace();

    // Parse HTML to extract segments with references
    const parsedSegments = useMemo(() => {
        const segments: ParsedSegment[] = [];
        const div = document.createElement('div');
        div.innerHTML = htmlContent;

        const paragraphs = div.querySelectorAll('p');
        paragraphs.forEach((para, index) => {
            const encodedRef = para.getAttribute('data-reference');
            const reference = encodedRef ? noteReferenceUtils.decodeReference(encodedRef) : null;

            segments.push({
                id: `segment-${index}`,
                text: para.innerHTML,
                reference,
            });
        });

        return segments;
    }, [htmlContent]);

    const handleSegmentClick = useCallback(
        (reference: IContentReference) => {
            if (reference?.type === 'youtube' && reference?.timestamp) {
                seekTo(reference.timestamp);
            }
        },
        [seekTo],
    );

    return (
        <TooltipProvider>
            <div className="prose max-w-none space-y-2">
                {parsedSegments.map((segment) =>
                    segment.reference ? (
                        <Tooltip key={segment.id} delayDuration={200}>
                            <TooltipTrigger asChild>
                                <div
                                    onClick={() => handleSegmentClick(segment.reference!)}
                                    className="group relative cursor-pointer rounded-md p-2 transition-colors hover:bg-yellow-100"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                                        if (e.key === 'Enter') {
                                            handleSegmentClick(segment.reference!);
                                        }
                                    }}
                                >
                                    {/*  eslint-disable-next-line @typescript-eslint/naming-convention */}
                                    <p dangerouslySetInnerHTML={{ __html: segment.text }} className="m-0 inline" />
                                    <span className="ml-2 text-xs text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
                                        📌
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="border border-slate-700 bg-slate-900 text-white">
                                <div className="text-sm">
                                    <p className="mb-1 font-semibold">Reference</p>
                                    <p className="text-xs">{noteReferenceUtils.formatReference(segment.reference)}</p>
                                    {segment.reference?.type === 'youtube' && segment.reference?.timestamp && (
                                        <p className="mt-1 text-xs">Click to go to timestamp</p>
                                    )}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        <p key={segment.id} dangerouslySetInnerHTML={{ __html: segment.text }} />
                    ),
                )}
            </div>
        </TooltipProvider>
    );
}
