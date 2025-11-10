import React from 'react';
import { isNil } from '@/utils';
import { ITranscriptSegment } from '../../../types';

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function validateTranscript(transcript: ITranscriptSegment[]) {
    return (
        Array.isArray(transcript) &&
        transcript.find(
            (segment) =>
                isNil(segment.startTime) ||
                typeof segment.startTime !== 'number' ||
                isNil(segment.endTime) ||
                typeof segment.endTime !== 'number' ||
                isNil(segment.text) ||
                typeof segment.text !== 'string',
        ) === undefined
    );
}

interface Props {
    transcript: ITranscriptSegment[];
    onSegmentClick: (seconds: number) => void;
}

function TranscriptViewer({ transcript, onSegmentClick }: Props) {
    if (!validateTranscript(transcript)) return <div className="p-8">Invalid transcript, please try again.</div>;
    return (
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-lg max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-primary">Transcript</h2>
            <div className="flex flex-col gap-3">
                {transcript.map((segment, index) => (
                    <div
                        key={index}
                        className="flex gap-4 items-start py-1 transition-all duration-150 hover:bg-muted/50 rounded-lg pr-2"
                        onClick={() => onSegmentClick(segment.startTime)}
                    >
                        <div className="w-16 flex-shrink-0 text-right text-sm font-medium text-muted-foreground select-none pt-0.5">
                            {formatTime(segment.startTime)}
                        </div>

                        <p className="flex-grow text-base leading-relaxed text-foreground cursor-pointer">
                            {segment.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TranscriptViewer;
