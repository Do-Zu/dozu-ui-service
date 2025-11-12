import { getRequest, patchRequest } from '@/api/api';
import { INote, IUpdateNoteBody, IUpdateNotePayload } from '../types/note.type';

class NoteService {
    public async getNoteForTopic({ topicId }: { topicId: number }) {
        const response = await getRequest<unknown, INote>(`/topics/${topicId}/notes`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async updateNotebyId({ topicId, noteId, content }: IUpdateNotePayload) {
        const response = await patchRequest<IUpdateNoteBody, INote>(`/topics/${topicId}/notes/${noteId}`, {
            content,
        });
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new NoteService();
