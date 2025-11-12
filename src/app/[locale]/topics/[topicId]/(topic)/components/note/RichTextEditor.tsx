'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import MenuBar from './MenuBar';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import './style.css';

interface Props {
    content: string;
    onContentChange: (content: string) => void;
    onSubmit: (content: string) => void;
    loading: boolean;
}

export default function RichTextEditor({ content, onContentChange, onSubmit, loading }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc ml-4',
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal ml-4',
                    },
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight.configure({
                multicolor: true,
                // HTMLAttributes: {
                //     class: 'hover:bg-blue-400',
                // },
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'min-h-[20vh] border rounded-md px-2 py-3',
            },
        },
        onUpdate: ({ editor }) => {
            onContentChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    if (!editor) {
        return null;
    }

    return (
        <div>
            <MenuBar editor={editor} content={content} onSubmit={onSubmit} loading={loading} />
            <EditorContent editor={editor} />
        </div>
    );
}
