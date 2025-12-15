import { postRequest } from '@/api/api';
import { ITranscriptSegment } from '../types';

class MediaTranscriptionService {
    public async getTranscripSegmentsFromMediaFile({ file }: { file: File }) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await postRequest<FormData, ITranscriptSegment[]>('/v1/audio-transcription', formData);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new MediaTranscriptionService();
