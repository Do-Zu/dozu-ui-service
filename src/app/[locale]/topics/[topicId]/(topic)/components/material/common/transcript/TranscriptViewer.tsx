import React, { forwardRef, memo } from 'react';
import { ITranscriptSegment } from '../../../../types';
import transcriptUtils from '../../../../utils/transcript.utils';

interface Props {
    transcript: ITranscriptSegment[];
    onSegmentClick: (seconds: number) => void;
}

const TranscriptViewer = forwardRef<HTMLDivElement, Props>(({ transcript, onSegmentClick }, ref) => {
    if (!transcriptUtils.validateTranscript(transcript))
        return <div className="p-8">Invalid transcript, please try again.</div>;

    return (
        <div className="h-full overflow-y-auto" ref={ref}>
            <div className=" mx-auto max-w-3xl rounded-xl border bg-card p-4 text-card-foreground shadow-lg">
                <h2 className="mb-4 border-b pb-2 text-xl font-bold text-primary">Transcript</h2>
                <div className="flex flex-col gap-3">
                    {transcript?.map((segment, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-4 rounded-lg py-1 pr-2 transition-all duration-150 hover:bg-muted/50"
                            role="button"
                            onClick={() => onSegmentClick(segment.startTime)}
                        >
                            <div className="w-16 shrink-0 select-none pt-0.5 text-right text-sm font-medium text-muted-foreground">
                                {transcriptUtils.formatTime(segment.startTime)}
                            </div>

                            <p className="grow cursor-pointer select-text text-base leading-relaxed text-foreground">
                                {segment.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

TranscriptViewer.displayName = 'TranscriptViewer';

export default memo(TranscriptViewer);
