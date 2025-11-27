'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import MenuBar from './MenuBar';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import './style.css';
import { useEffect } from 'react';
import LoadingNode from '../common/LoadingNode';
import { CustomBubbleMenu } from './CustomBubbleMenu';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node';
import { handleImageUpload } from '@/lib/tiptap-utils';
import toastHelper from '@/utils/toast.helper';
import Image from '@tiptap/extension-image';
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';

import './style.css';
import '@/components/tiptap-node/image-node/image-node.scss';

interface Props {
    content: string;
    onContentChange: (content: string) => void;
    onSubmit: (content: string) => void;
    loading: boolean;
    isGenerating?: boolean;
}

const maxFileSize = 1024 * 1024; // 1MB

export default function RichTextEditor({ content, onContentChange, onSubmit, loading, isGenerating }: Props) {
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
            }),
            BubbleMenu,
            Image,
            ImageUploadNode.configure({
                accept: 'image/*',
                upload: handleImageUpload,
                onError() {
                    toastHelper.showErrorMessage('Failed to upload image.');
                },
                maxSize: maxFileSize,
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

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [editor, content]);

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            <MenuBar editor={editor} onSubmit={onSubmit} loading={loading} />
            <CustomBubbleMenu editor={editor} />
            <ImageUploadButton editor={editor} text="Add image" hideWhenUnavailable={true} />
            <EditorContent editor={editor} />
            {isGenerating ? <LoadingNode title="Generating" /> : null}
        </div>
    );
}
