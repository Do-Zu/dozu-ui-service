'use client'

import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Editor } from '@tiptap/react';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Italic,
    List,
    ListOrdered,
    Save,
    Strikethrough,
} from 'lucide-react';
import React from 'react';

interface Option {
    icon: React.ReactNode;
    onClick: () => void;
    pressed: boolean;
}

interface Props {
    editor: Editor;
    content: string;
    onSubmit: (content: string) => void;
    loading: boolean;
}

export default function MenuBar({ editor, content, onSubmit, loading }: Props) {
    const options: Option[] = [
        {
            icon: <Heading1 className="size-4" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            pressed: editor.isActive('heading', { level: 1 }),
        },
        {
            icon: <Heading2 className="size-4" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            pressed: editor.isActive('heading', { level: 2 }),
        },
        {
            icon: <Heading3 className="size-4" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            pressed: editor.isActive('heading', { level: 3 }),
        },
        {
            icon: <Bold className="size-4" />,
            onClick: () => editor.chain().focus().toggleBold().run(),
            pressed: editor.isActive('bold'),
        },
        {
            icon: <Italic className="size-4" />,
            onClick: () => editor.chain().focus().toggleItalic().run(),
            pressed: editor.isActive('italic'),
        },
        {
            icon: <Strikethrough className="size-4" />,
            onClick: () => editor.chain().focus().toggleStrike().run(),
            pressed: editor.isActive('strike'),
        },
        {
            icon: <AlignLeft className="size-4" />,
            onClick: () => editor.chain().focus().setTextAlign('left').run(),
            pressed: editor.isActive({ textAlign: 'left' }),
        },
        {
            icon: <AlignCenter className="size-4" />,
            onClick: () => editor.chain().focus().setTextAlign('center').run(),
            pressed: editor.isActive({ textAlign: 'center' }),
        },
        {
            icon: <AlignRight className="size-4" />,
            onClick: () => editor.chain().focus().setTextAlign('right').run(),
            pressed: editor.isActive({ textAlign: 'right' }),
        },
        {
            icon: <List className="size-4" />,
            onClick: () => editor.chain().focus().toggleBulletList().run(),
            pressed: editor.isActive('bulletList'),
        },
        {
            icon: <ListOrdered className="size-4" />,
            onClick: () => editor.chain().focus().toggleOrderedList().run(),
            pressed: editor.isActive('orderedList'),
        },
        {
            icon: <Highlighter className="size-4" />,
            onClick: () => editor.chain().focus().toggleHighlight().run(),
            pressed: editor.isActive('highlight'),
        },
    ];

    return (
        <div className="flex justify-between items-center border rounded-md p-2 mb-4 z-50">
            <div className="flex space-x-2">
                {options.map((option, index) => (
                    <Toggle key={index} pressed={option.pressed} onPressedChange={option.onClick}>
                        {option.icon}
                    </Toggle>
                ))}
            </div>

            <Button
                className="flex items-center gap-2"
                variant="ghost"
                onClick={() => onSubmit(content)}
                disabled={loading}
            >
                <Save className="w-4 h-4" />
                {loading ? 'Saving' : 'Save'}
            </Button>
        </div>
    );
}
