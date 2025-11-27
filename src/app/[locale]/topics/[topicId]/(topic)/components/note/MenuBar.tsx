'use client';

import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Editor } from '@tiptap/react';
import { Loader2, Save } from 'lucide-react';
import React from 'react';
import useTiptapOptions from '../../hooks/tiptap/useTiptapOptions';

interface Option {
    icon: React.ReactNode;
    onClick: () => void;
    pressed: boolean;
}

interface Props {
    editor: Editor;
    onSubmit: (content: string) => void;
    loading: boolean;
}

export default function MenuBar({ editor, onSubmit, loading }: Props) {
    const { options } = useTiptapOptions({ editor });

    return (
        <div className="flex justify-between items-center border rounded-md p-2 z-50">
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
                onClick={() => onSubmit(editor.getHTML())}
                disabled={loading}
            >
                <Save className="w-4 h-4" />
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save'}
            </Button>
        </div>
    );
}
