'use client';

import { useCallback, useEffect, useState } from 'react';
import RichTextEditor from '../note/RichTextEditor';
import useFetch from '@/hooks/useFetch';
import { INote, IUpdateNotePayload } from '../../types/note.type';
import noteService from '../../service/note.service';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import LoadingPage from '@/app/loading';
import DataStatus from '@/components/errors/DataStatus';
import toastHelper from '@/utils/toast.helper';
import { isNil } from '@/utils';
import { METHOD_LEARNING } from '@/utils/constants/method';
import { Button } from '@/components/ui/button';
import { useUpdateNoteAsync } from '../../hooks/useNote';
import { Loader2, Save } from 'lucide-react';
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
    }, [fetchedNote, setNote]);

    const [content, setContent] = useState<string>('');
    const [generatedSummary, setGeneratedSummary] = useState<string>('');

    useEffect(() => {
        if (note) {
            setContent(note.content);
        }
    }, [note]);

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
        const updatedContent = content.concat(summary);
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

    const onGenerateClick = async () => {
        reset();
        setGeneratedSummary('');
        await execute({ content: contentTextOrigin.current, method: 'POST', type: METHOD_LEARNING.SHORT_SUMMARY });
    };

    if (fetchedNoteError) {
        return <DataStatus variant="error" />;
    }
    if (fetchedNoteLoading || (fetchedNote?.content && !content)) {
        return <LoadingPage />;
    }

    return (
        <div className="size-full flex-col gap-4 pb-10 pr-6">
            {generatedSummary.length > 0 ? null : (
                <div className="flex flex-row items-center justify-center gap-4 pt-8">
                    <div className="bg-white text-muted-foreground shadow-sm">
                        Create a brief summary based on your inputted content
                    </div>

                    {isGenerating ? (
                        <Loader2 className="size-5 animate-spin" />
                    ) : (
                        <Button className="rounded-lg" onClick={onGenerateClick} disabled={isGenerating}>
                            Generate
                        </Button>
                    )}
                </div>
            )}

            {generatedSummary.length > 0 ? (
                <div className="flex h-full flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xl font-bold">Summary Preview</div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onAddSummaryToNote(generatedSummary)}
                            hidden={isGenerating}
                            disabled={updateNoteLoading}
                        >
                            {updateNoteLoading ? <Loader2 className="size-5 animate-spin" /> : <Save />}
                        </Button>
                    </div>
                    <RichTextEditor
                        key="generated_summary"
                        content={generatedSummary}
                        onContentChange={(content) => setGeneratedSummary(content)}
                        isGenerating={isGenerating}
                        className="pb-10"
                    />
                </div>
            ) : (
                <div className="flex h-full flex-col gap-4">
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onSubmit(content)}
                            disabled={updateNoteLoading}
                        >
                            {updateNoteLoading ? <Loader2 className="size-5 animate-spin" /> : <Save />}
                        </Button>
                    </div>
                    <RichTextEditor
                        key="main_content"
                        content={content}
                        onContentChange={(content) => setContent(content)}
                    />
                </div>
            )}
        </div>
    );
}
