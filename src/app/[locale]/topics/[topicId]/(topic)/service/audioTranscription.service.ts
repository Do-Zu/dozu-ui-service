import { postRequest } from '@/api/api';
import { ITranscriptSegment } from '../types';

class AudioTranscriptionService {
    public async getTranscripSegmentsFromAudio({ audioFile }: { audioFile: File }) {
        const formData = new FormData();
        formData.append('file', audioFile);
        const response = await postRequest<FormData, ITranscriptSegment[]>('/v1/audio-transcription', formData);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new AudioTranscriptionService();
