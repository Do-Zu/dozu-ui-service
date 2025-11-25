import { getRequest, putRequest } from '@/api/api';
import { INote, IUpdateNoteBody, IUpdateNotePayload } from '../types/note.type';

class NoteService {
    public async getNoteForTopic({ topicId }: { topicId: number }) {
        const response = await getRequest<unknown, INote | null>(`/topics/${topicId}/notes`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async updateNote({ topicId, content }: IUpdateNotePayload) {
        const response = await putRequest<IUpdateNoteBody, INote>(`/topics/${topicId}/note`, {
            content,
        });
        if (response.status !== 'success' && response.status !== 'created') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new NoteService();
