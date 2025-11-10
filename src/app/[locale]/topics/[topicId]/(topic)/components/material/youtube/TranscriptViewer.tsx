import React from 'react';
import { ITranscriptSegment } from '../../../types';
import transcriptUtils from '../../../utils/transcript.utils';

interface Props {
    transcript: ITranscriptSegment[];
    onSegmentClick: (seconds: number) => void;
}

function TranscriptViewer({ transcript, onSegmentClick }: Props) {
    if (!transcriptUtils.validateTranscript(transcript))
        return <div className="p-8">Invalid transcript, please try again.</div>;
    return (
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-lg max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-primary">Transcript</h2>
            <div className="flex flex-col gap-3">
                {transcript.map((segment, index) => (
                    <div
                        key={index}
                        className="flex gap-4 items-start py-1 transition-all duration-150 hover:bg-muted/50 rounded-lg pr-2"
                        role="button"
                        onClick={() => onSegmentClick(segment.startTime)}
                    >
                        <div className="w-16 flex-shrink-0 text-right text-sm font-medium text-muted-foreground select-none pt-0.5">
                            {transcriptUtils.formatTime(segment.startTime)}
                        </div>

                        <p className="flex-grow text-base leading-relaxed text-foreground cursor-pointer select-text">
                            {segment.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TranscriptViewer;
