import { ITranscriptSegment } from '../../types';

class MediaUtils {
    public getMediaContent({ segments, start, end }: { segments: ITranscriptSegment[]; start: number; end: number }) {
        const content = segments
            .filter((item) => item.startTime >= start && item.startTime <= end)
            .map((item) => item.text)
            .join(' ');
        return content;
    }
}

export default new MediaUtils();
