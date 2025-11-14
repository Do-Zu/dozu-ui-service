import { isNil } from '@/utils';
import { ITranscriptSegment } from '../types';

class TranscriptUtils {
    public formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    public validateTranscript(transcript: ITranscriptSegment[]) {
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
}

export default new TranscriptUtils();