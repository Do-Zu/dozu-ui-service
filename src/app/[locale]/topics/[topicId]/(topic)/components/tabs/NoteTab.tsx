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
import { useUpdateNoteAsync } from '../../hooks/useNote';
import { Loader2 } from 'lucide-react';
import useGenerateStream from '@/hooks/generate/useGenerateStream';

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

    const { updateNoteAsync, updateNoteLoading } = useUpdateNoteAsync();

    const onSubmit = useCallback(
        async (content: string) => {
            if (note && content === note.content) {
                toastHelper.showSuccessMessage('Please edit your note before submitting.');
                return;
            }
            const payload: IUpdateNotePayload = { topicId, content };
            await updateNoteAsync(payload);
        },
        [note, topicId, updateNoteAsync],
    );

    const onAddSummaryToNote = async (summary: string) => {
        const updatedContent = content.concat('<p></p>' + summary);
        const payload: IUpdateNotePayload = { topicId, content: updatedContent };
        await updateNoteAsync(payload);
        setGeneratedSummary('');
    };

    const { contentTextOrigin } = useTopicWorkspace();

    const { isGenerating, execute, reset } = useGenerateStream({
        onChunk(chunk) {
            const data = 'data' in chunk ? chunk.data : null;
            if (data && typeof data === 'string') {
                setGeneratedSummary((prev) => prev + data);
            }
        },
        onSuccess() {
            toastHelper.showSuccessMessage('Generate short summary successfully');
        },
        onError() {
            toastHelper.showErrorMessage('Failed to generate a short summary for your topic, please try again.');
        },
    });

    async function onGenerateClick() {
        reset();
        setGeneratedSummary('');
        await execute({ content: contentTextOrigin.current, method: 'POST', type: METHOD_LEARNING.SHORT_SUMMARY });
    }

    if (fetchedNoteError) {
        return <DataStatus variant="error" />;
    }
    if (fetchedNoteLoading || (fetchedNote?.content && !content)) {
        return <LoadingPage />;
    }

    return (
        <ScrollArea className="w-full h-full flex-col gap-4 pb-16 pr-6">
            {generatedSummary.length > 0 ? null : (
                <div className="flex flex-row items-center justify-center gap-4 p-8">
                    <div className="bg-white shadow-sm text-muted-foreground">
                        Create a brief summary based on your inputted content
                    </div>

                    {isGenerating ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Button className="rounded-lg" onClick={onGenerateClick} disabled={isGenerating}>
                            Generate
                        </Button>
                    )}
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
                        isGenerating={isGenerating}
                    />
                </div>
            ) : (
                <RichTextEditor
                    key="main_content"
                    content={content}
                    onContentChange={(content) => setContent(content)}
                    onSubmit={onSubmit}
                    loading={updateNoteLoading}
                />
            )}
        </ScrollArea>
    );
}
