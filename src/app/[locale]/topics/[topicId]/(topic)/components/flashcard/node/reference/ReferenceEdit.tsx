import React from 'react';
import PdfReferenceEdit from './PdfReferenceEdit';
import MediaSegmentReferenceEdit from './MediaSegmentReferenceEdit';
import { ITranscriptSegment } from '../../../../types';

interface PdfReference {
    type: 'pdf';
    pageStartIndex: number | undefined;
    onPageStartIndexChange: (value: string) => void;
    pageEndIndex: number | undefined;
    onPageEndIndexChange: (value: string) => void;
    onPageClick?: (page: number | undefined) => void;
}

interface MediaSegmentReference {
    type: 'youtube' | 'media';
    segments: ITranscriptSegment[];
    startSegment: number | undefined;
    onStartSegmentChange: (value: string) => void;
    endSegment: number | undefined;
    onEndSegmentChange: (value: string) => void;
    onSegmentClick?: (segment: number | undefined) => void;
}

type Props = { isEditing: boolean } & (PdfReference | MediaSegmentReference);

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
        case 'youtube':
        case 'media': {
            const { segments, startSegment, onStartSegmentChange, endSegment, onEndSegmentChange, onSegmentClick } =
                props;
            if (typeof segments === 'string') {
                return <div className="p-8">This type of segments is not yet supported</div>;
            }
            return (
                <MediaSegmentReferenceEdit
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
