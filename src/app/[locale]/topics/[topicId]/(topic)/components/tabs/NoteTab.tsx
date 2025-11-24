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
import Generate from '../generate/Generate';
import { METHOD_LEARNING } from '@/utils/constants/method';
import { ScrollArea } from '@/components/ui/scroll-area';
import noteUtils from '../../utils/note.utils';
import { Button } from '@/components/ui/button';

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
    const [generatedSummary, setGeneratedSummary] = useState<string>('');

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

    const onAddSummaryToNote = async (summary: string) => {
        if (!note) return;
        const updatedContent = content.concat('<p></p>' + summary);
        const payload: IUpdateNotePayload = { topicId: note.topicId, noteId: note.noteId, content: updatedContent };
        await updateNoteAsync(payload);
        setGeneratedSummary('');
    };

    function onGenerateShortSummarySuccess(data: any) {
        const { isValid, summary } = noteUtils.validateGeneratedSummary(data);
        if (!isValid) {
            toastHelper.showErrorMessage('Failed to generate a short summary for your topic, please try again.');
            return;
        }
        toastHelper.showSuccessMessage('Generate short summary successfully');
        setGeneratedSummary(summary);
    }

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
        <ScrollArea className="w-full h-full flex-col gap-4 pb-16">
            {generatedSummary.length > 0 ? null : (
                <div className="flex flex-row items-center justify-center gap-4 p-8">
                    <div className="border rounded-xl px-4 py-2 bg-white shadow-sm text-muted-foreground">
                        Create a brief summary based on your inputted content
                    </div>

                    <Generate
                        type={METHOD_LEARNING.SHORT_SUMMARY}
                        onSuccess={onGenerateShortSummarySuccess}
                        trigger={<Button className="rounded-lg">Generate</Button>}
                    />
                </div>
            )}

            {generatedSummary.length > 0 ? (
                <div className="flex flex-col gap-4">
                    <div className="text-xl font-bold">Summary Preview</div>
                    <RichTextEditor
                        key="generated_summary"
                        content={generatedSummary}
                        onContentChange={(content) => setGeneratedSummary(content)}
                        onSubmit={onAddSummaryToNote}
                        loading={updateNoteLoading}
                    />
                </div>
            ) : (
                <RichTextEditor
                    key="main_content"
                    content={content}
                    onContentChange={onContentChange}
                    onSubmit={onSubmit}
                    loading={updateNoteLoading}
                />
            )}
        </ScrollArea>
    );
}
