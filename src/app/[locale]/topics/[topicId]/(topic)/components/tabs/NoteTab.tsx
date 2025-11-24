'use client';

import { useCallback, useEffect, useState } from 'react';
import RichTextEditor from '../note/RichTextEditor';
import useFetch from '@/hooks/useFetch';
import { INote, IUpdateNotePayload } from '../../types/note.type';
import noteService from '../../service/note.service';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import LoadingPage from '@/app/loading';
import DataStatus from '@/components/errors/DataStatus';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { isNil } from '@/utils';

export default function NoteTab() {
    const { topicId, tab, note, setNote } = useTopicWorkspace();

    const {
        data: fetchedNote,
        loading: fetchedNoteLoading,
        error: fetchedNoteError,
    } = useFetch<INote>(() => noteService.getNoteForTopic({ topicId }), { shouldRun: isNil(note) && tab === 'note' });

    useEffect(() => {
        if (fetchedNote) {
            setNote(fetchedNote);
        }
    }, [fetchedNote]);

    const [content, setContent] = useState<string>('');

    useEffect(() => {
        if (note) {
            setContent(note.content);
        }
    }, [note?.content]);

    function onContentChange(content: string) {
        setContent(content);
    }

    const { execute: updateNoteAsync, loading: updateNoteLoading } = usePost<IUpdateNotePayload, INote>(
        noteService.updateNotebyId,
        'PATCH',
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

    const onSubmit = useCallback(
        async (content: string) => {
            if (!note) return;
            if (content === note.content) {
                toastHelper.showSuccessMessage('Please edit your note before submitting.');
                return;
            }
            const payload: IUpdateNotePayload = { topicId: note.topicId, noteId: note.noteId, content };
            await updateNoteAsync(payload);
        },
        [note, updateNoteAsync],
    );

    if (fetchedNoteError) {
        return <DataStatus variant="error" />;
    }
    if (fetchedNoteLoading || (fetchedNote?.content && !content)) {
        return <LoadingPage />;
    }
    if (!note) {
        return <DataStatus variant="empty" />;
    }

    return (
        <div className="w-full h-full">
            <RichTextEditor
                content={content}
                onContentChange={onContentChange}
                onSubmit={onSubmit}
                loading={updateNoteLoading}
            />
        </div>
    );
}
