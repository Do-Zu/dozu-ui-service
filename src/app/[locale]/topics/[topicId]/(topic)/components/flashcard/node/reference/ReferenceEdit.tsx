import React from 'react';
import PdfReferenceEdit from './PdfReferenceEdit';
import YoutubeReferenceEdit from './YoutubeReferenceEdit';
import { ITranscriptSegment } from '../../../../types';

interface PdfReference {
    type: 'pdf';
    pageStartIndex: number | undefined;
    onPageStartIndexChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    pageEndIndex: number | undefined;
    onPageEndIndexChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPageClick: (page: number | undefined) => void;
}

interface YoutubeReference {
    type: 'youtube';
    segments: ITranscriptSegment[] | string;
    startSegment: number | undefined;
    onStartSegmentChange: (value: string) => void;
    endSegment: number | undefined;
    onEndSegmentChange: (value: string) => void;
    onSegmentClick: (segment: number | undefined) => void;
}

type Props = { isEditing: boolean } & (PdfReference | YoutubeReference);

export default function ReferenceEdit(props: Props) {
    const { type, isEditing } = props;
    switch (type) {
        case 'pdf': {
            const { pageStartIndex, onPageStartIndexChange, pageEndIndex, onPageEndIndexChange, onPageClick } = props;
            return (
                <PdfReferenceEdit
                    isEditing={isEditing}
                    pageStartIndex={pageStartIndex}
                    onPageStartIndexChange={onPageStartIndexChange}
                    pageEndIndex={pageEndIndex}
                    onPageEndIndexChange={onPageEndIndexChange}
                    onPageClick={onPageClick}
                />
            );
        }
        case 'youtube': {
            const { segments, startSegment, onStartSegmentChange, endSegment, onEndSegmentChange, onSegmentClick } = props;
            if (typeof segments === 'string') {
                return <div className="p-8">This type of segments is not yet supported</div>;
            }
            return (
                <YoutubeReferenceEdit
                    isEditing={isEditing}
                    segments={segments}
                    startSegment={startSegment}
                    onStartSegmentChange={onStartSegmentChange}
                    endSegment={endSegment}
                    onEndSegmentChange={onEndSegmentChange}
                    onSegmentClick={onSegmentClick}
                />
            );
        }
    }
}
