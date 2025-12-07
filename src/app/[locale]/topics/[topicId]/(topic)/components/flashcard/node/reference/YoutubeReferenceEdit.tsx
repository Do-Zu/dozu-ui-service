import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EyeIcon } from 'lucide-react';
import { ITranscriptSegment } from '../../../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import transcriptUtils from '../../../../utils/transcript.utils';
import { Button } from '@/components/ui/button';

interface YoutubeReferenceItemProps {
    segments: ITranscriptSegment[];
    label: string;
    isEditing: boolean;
    segment: number | undefined;
    onSegmentChange: (value: string) => void;
    onSegmentClick: (segment: number | undefined) => void;
}
function YoutubeReferenceItem({
    segments,
    label,
    isEditing,
    segment,
    onSegmentChange,
    onSegmentClick,
}: YoutubeReferenceItemProps) {
    function getShortSegmentText(text: string) {
        return text.slice(0, 20);
    }

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">{label}</Label>
            </div>

            {isEditing ? (
                <Select value={segment ? String(segment) : undefined} onValueChange={onSegmentChange}>
                    <SelectTrigger
                        className={`h-9 text-sm transition-all ${!isEditing ? 'cursor-pointer border-primary/50 bg-muted/60 hover:bg-muted' : ''}`}
                    >
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>

                    <SelectContent>
                        {segments.map((seg, index) => (
                            <SelectItem key={index} value={String(seg.startTime)}>
                                {`[${transcriptUtils.formatTime(seg.startTime)}s] ${getShortSegmentText(seg.text)}...`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : null}

            {!isEditing ? (
                <TooltipProvider>
                    <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                            <Button variant="outline" onClick={() => onSegmentClick(segment)}>
                                {!segment ? 'No segment yet' : `[${transcriptUtils.formatTime(segment)}s]`}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-sm">
                            <p className="font-medium">Click to preview content for this segment.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : null}
        </div>
    );
}

interface Props {
    isEditing: boolean;
    segments: ITranscriptSegment[];
    startSegment: number | undefined;
    onStartSegmentChange: (value: string) => void;
    endSegment: number | undefined;
    onEndSegmentChange: (value: string) => void;
    onSegmentClick: (segment: number | undefined) => void;
}

export default function YoutubeReferenceEdit({
    isEditing,
    segments,
    startSegment,
    onStartSegmentChange,
    endSegment,
    onEndSegmentChange,
    onSegmentClick,
}: Props) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <YoutubeReferenceItem
                segments={segments}
                label="Start Segment"
                isEditing={isEditing}
                segment={startSegment}
                onSegmentChange={onStartSegmentChange}
                onSegmentClick={onSegmentClick}
            />

            <YoutubeReferenceItem
                segments={segments}
                label="End Segment"
                isEditing={isEditing}
                segment={endSegment}
                onSegmentChange={onEndSegmentChange}
                onSegmentClick={onSegmentClick}
            />
        </div>
    );
}
