'use client';

import { NodeViewContent, NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import noteReferenceUtils from '../../utils/note-reference.utils';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import React, { useCallback, useMemo } from 'react';

export default function ReferenceNodeView({ node }: ReactNodeViewProps) {
    const { seekTo, learningMaterial } = useTopicWorkspace();
    const encodedRef = node.attrs.dataReference as string | null;

    const reference = useMemo(() => {
        if (!encodedRef) return null;
        return noteReferenceUtils.decodeReference(encodedRef);
    }, [encodedRef]);

    const referenceLabel = useMemo(() => {
        if (!reference) return '';
        return noteReferenceUtils.formatReference(reference);
    }, [reference]);

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!reference) return;

            if ((reference.type === 'youtube' || reference.type === 'media') && reference.timestamp != null) {
                seekTo(reference.timestamp);
            }

            if (reference.type === 'file' && reference.page && learningMaterial) {
                // PDF page navigation can be extended with setPageNumber if available
            }
        },
        [reference, seekTo, learningMaterial],
    );

    // If no reference, render as a normal paragraph
    if (!reference) {
        return (
            <NodeViewWrapper as="p">
                <NodeViewContent />
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper as="div">
            <TooltipProvider>
                <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                        <p
                            onClick={handleClick}
                            className="reference-paragraph"
                            data-reference={encodedRef}
                            data-reference-active="true"
                        >
                            <NodeViewContent />
                        </p>
                    </TooltipTrigger>
                    <TooltipContent
                        side="top"
                        className="z-50 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white shadow-lg"
                    >
                        <div className="text-sm">
                            <p className="mb-1 font-semibold">📌 Reference</p>
                            <p className="text-xs">{referenceLabel}</p>
                            {(reference.type === 'youtube' || reference.type === 'media') &&
                                reference.timestamp != null && (
                                    <p className="mt-1 text-xs text-yellow-300">Click to jump to this position</p>
                                )}
                            {reference.type === 'file' && reference.page != null && (
                                <p className="mt-1 text-xs text-yellow-300">Source: Page {reference.page}</p>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </NodeViewWrapper>
    );
}
