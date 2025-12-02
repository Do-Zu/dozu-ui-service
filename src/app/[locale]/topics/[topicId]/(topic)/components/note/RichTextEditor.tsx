'use client';

import { EditorContent, ReactRenderer, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { ComponentProps, createRef, useEffect, useRef } from 'react';
import LoadingNode from '../common/LoadingNode';
import { CustomBubbleMenu } from './CustomBubbleMenu';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node';
import toastHelper from '@/utils/toast.helper';
import Image from '@tiptap/extension-image';

import './style.css';
import '@/components/tiptap-node/image-node/image-node.scss';
import noteUtils from '../../utils/note.utils';
import { Placeholder } from '@tiptap/extensions';
import { TableKit } from '@tiptap/extension-table';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import useCommandOptions, { CommandOptionProps } from '../../hooks/tiptap/useCommandOptions';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import createCommandsPlugin from '../../utils/tiptap/createCommandsPlugin';
import { MAX_IMAGE_SIZE } from '@/services/image/image.service';

interface Props {
    content: string;
    onContentChange: (content: string) => void;
    isGenerating?: boolean;
    className?: string;
}

const lowlight = createLowlight();
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('ts', ts);
lowlight.register('c', c);
lowlight.register('cpp', cpp);

export default function RichTextEditor({ content, onContentChange, isGenerating, className }: Props) {
    const imageUploadButtonRef = useRef<HTMLButtonElement>(null);
    const { options } = useCommandOptions({ imageUploadButtonRef });

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
                upload: noteUtils.handleImageUpload,
                onError(err) {
                    toastHelper.showErrorMessage(err);
                },
                maxSize: MAX_IMAGE_SIZE,
            }),
            createCommandsPlugin(options),
            Placeholder.configure({
                placeholder: () => {
                    return "Press '/' to see command list...";
                },
            }),
            TableKit.configure({
                table: { resizable: true },
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: cn('min-h-[60vh] border-2 rounded-lg p-6', 'tiptap'),
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
        <ScrollArea className={cn('h-full flex flex-col gap-4 relative pb-20', className)}>
            <CustomBubbleMenu editor={editor} />
            <EditorContent editor={editor} />
            {isGenerating ? <LoadingNode title="Generating" /> : null}
        </ScrollArea>
    );
}
