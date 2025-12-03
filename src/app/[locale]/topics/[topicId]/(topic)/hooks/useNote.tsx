import usePost from '@/hooks/usePost';
import { INote, IUpdateNotePayload } from '../types/note.type';
import noteService from '../service/note.service';
import toastHelper from '@/utils/toast.helper';
import { useTopicWorkspace } from '../context/TopicWorkspaceContext';

export const useUpdateNoteAsync = () => {
    const { setNote } = useTopicWorkspace();

    const { execute: updateNoteAsync, loading: updateNoteLoading } = usePost<IUpdateNotePayload, INote>(
        noteService.updateNote,
        'PUT',
        {
            onError(error) {
                toastHelper.showErrorMessage(error);
            },
            onSuccess(data) {
                if (data) {
                    toastHelper.showSuccessMessage('Save note successfully');
                    setNote(data);
                }
            },
        },
    );

    return { updateNoteAsync, updateNoteLoading };
};
