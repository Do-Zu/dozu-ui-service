'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    Code,
    CornerDownLeft,
    Eraser,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    ItalicIcon,
    ListOrdered,
    Minus,
    Pilcrow,
    Quote,
    Redo2,
    SquareCode,
    Strikethrough,
    Trash2,
    Undo2,
} from 'lucide-react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Editor, Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { normalize } from '@/utils';
import MenuBar from './MenuEditorBar';

type EditorProps = {
    value: string;
    onChange: (next: string, highlighted: string[]) => void;
    placeholder?: string;
    maxLength?: number;
    minWordLength?: number;
    className?: string;
};

function detectJargon(text: string, minWordLength = 9): string[] {
    const words = normalize(text);
    const counts = new Map<string, number>();
    for (const w of words) {
        if (w.length >= minWordLength) {
            counts.set(w, (counts.get(w) || 0) + 1);
        }
    }
    // Return unique sorted by frequency desc
    const arr: Array<[string, number]> = [];
    counts.forEach((v, k) => arr.push([k, v]));
    return arr.sort((a, b) => b[1] - a[1]).map(([w]) => w);
}

// Replace previous HIGHLIGHT_COLORS with underline colors for the jargon highlighter
const JARGON_COLORS = [
    { name: 'Red', decorationClass: 'decoration-red-500', previewClass: 'bg-red-200' },
    { name: 'Yellow', decorationClass: 'decoration-yellow-500', previewClass: 'bg-yellow-200' },
    { name: 'Green', decorationClass: 'decoration-green-500', previewClass: 'bg-green-200' },
    { name: 'Blue', decorationClass: 'decoration-blue-500', previewClass: 'bg-blue-200' },
    { name: 'Purple', decorationClass: 'decoration-purple-500', previewClass: 'bg-purple-200' },
];

export const FeynmanEditor: React.FC<EditorProps> = ({
    value,
    onChange,
    placeholder = 'Explain this topic as if you’re teaching a friend who knows nothing about it…',
    maxLength = 4000,
    minWordLength = 9,
    className,
}) => {
    const [highlighted, setHighlighted] = useState<string[]>([]);
    // Add: user-selected words with chosen underline color
    const [userWordColors, setUserWordColors] = useState<Record<string, string>>({});
    // Add: floating toolbar for left-mouse selection
    const [selectionMenu, setSelectionMenu] = useState<{ x: number; y: number; show: boolean }>({
        x: 0,
        y: 0,
        show: false,
    });

    const JargonHighlighter = Extension.create({
        name: 'jargonHighlighter',
        addOptions() {
            return {
                // replace getWords with two sources: detected list + user-chosen colors
                getDetectedWords: () => [] as string[],
                getWordColors: () => ({}) as Record<string, string>,
            };
        },
        addProseMirrorPlugins() {
            return [
                new Plugin({
                    key: new PluginKey('jargonHighlighter'),
                    state: {
                        init: () => DecorationSet.empty,
                        apply: (tr, old, _oldState, newState) => {
                            if (tr.docChanged || tr.getMeta('updateJargon')) {
                                const detected: string[] = this.options.getDetectedWords?.() || [];
                                const wordColors: Record<string, string> = this.options.getWordColors?.() || {};

                                const allWords = new Set<string>([...detected, ...Object.keys(wordColors || {})]);

                                if (!allWords.size) return DecorationSet.empty;

                                const decos: Decoration[] = [];
                                newState.doc.descendants((node, pos) => {
                                    if (!node.isText) return;
                                    const text = node.text || '';

                                    allWords.forEach((w) => {
                                        const colorClass = wordColors[w.toLowerCase?.() || w] || 'decoration-red-500';

                                        const re = new RegExp(
                                            `\\b${w.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`,
                                            'gi',
                                        );
                                        let m;
                                        while ((m = re.exec(text)) !== null) {
                                            decos.push(
                                                Decoration.inline(pos + m.index, pos + m.index + m[0].length, {
                                                    class: `underline decoration-2 underline-offset-2 ${colorClass}`,
                                                    title: 'Marked as jargon — consider simplifying.',
                                                }),
                                            );
                                        }
                                    });
                                });

                                return DecorationSet.create(newState.doc, decos);
                            }
                            return old.map(tr.mapping, tr.doc);
                        },
                    },
                    props: {
                        decorations(state) {
                            return this.getState(state);
                        },
                    },
                }),
            ];
        },
    });

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ bulletList: { keepMarks: true }, orderedList: false }),
            Underline,
            // removed Highlight extension
            Placeholder.configure({ placeholder }),
            JargonHighlighter,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const plain = editor.getText();
            if (plain.length > maxLength) return;
            const jargon = detectJargon(plain, minWordLength);
            setHighlighted(jargon);
            onChange(plain, jargon);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words focus:outline-none',
            },
            handleDOMEvents: {
                // Show floating toolbar on right-click when text is selected (kept)
                contextmenu: (view, event) => {
                    const { from, to } = view.state.selection;
                    if (from !== to) {
                        event.preventDefault();
                        const e = event as MouseEvent;
                        setSelectionMenu({
                            x: e.clientX,
                            y: e.clientY,
                            show: true,
                        });
                        return true;
                    }
                    return false;
                },
                // Show the toolbar immediately after left-mouse selection
                mouseup: (_view, event) => {
                    const e = event as MouseEvent;
                    // Only react to left button
                    if (e.button !== 0) return false;

                    const sel = window.getSelection?.();
                    if (!sel || sel.rangeCount === 0) {
                        setSelectionMenu({ x: 0, y: 0, show: false });
                        return false;
                    }
                    const range = sel.getRangeAt(0);
                    if (range.collapsed) {
                        setSelectionMenu({ x: 0, y: 0, show: false });
                        return false;
                    }
                    const rect = range.getBoundingClientRect();
                    if (rect && rect.width >= 0 && rect.height >= 0) {
                        setSelectionMenu({
                            x: rect.left + window.scrollX,
                            y: rect.bottom + window.scrollY + 6,
                            show: true,
                        });
                    }
                    return false;
                },
            },
        },
    });

    // Utility: get selected words (normalized)
    const getSelectedWords = useCallback((): string[] => {
        if (!editor) return [];
        const { from, to } = editor.state.selection;
        if (from === to) return [];
        const text = editor.state.doc.textBetween(from, to, ' ', ' ');
        return normalize(text);
    }, [editor]);

    // Apply underline color for selected words via JargonHighlighter
    const handleMarkColor = useCallback(
        (decorationClass: string) => {
            const words = getSelectedWords();
            if (words.length) {
                setUserWordColors((prev) => {
                    const next = { ...prev };
                    words.forEach((w) => {
                        next[w] = decorationClass;
                    });
                    return next;
                });
            }
            setSelectionMenu({ x: 0, y: 0, show: false });
        },
        [getSelectedWords],
    );

    const handleUnmark = useCallback(() => {
        const words = getSelectedWords();
        if (words.length) {
            setUserWordColors((prev) => {
                const next = { ...prev };
                words.forEach((w) => {
                    delete next[w];
                });
                return next;
            });
        }
        setSelectionMenu({ x: 0, y: 0, show: false });
    }, [getSelectedWords]);

    // Close floating toolbar on outside click, scroll, or resize
    useEffect(() => {
        if (!selectionMenu.show) return;

        const close = () => setSelectionMenu({ x: 0, y: 0, show: false });
        const onDocClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            // click inside the bubble should not close (we also stopPropagation below)
            if (target && target.closest?.('#feynman-selection-toolbar')) return;
            close();
        };

        document.addEventListener('click', onDocClick);
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        return () => {
            document.removeEventListener('click', onDocClick);
            window.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
        };
    }, [selectionMenu.show]);

    // Keep external value in sync (e.g., restore)
    useEffect(() => {
        if (editor && editor.getText() !== value) {
            editor.commands.setContent(value || '', false);
        }
    }, [value, editor]);

    // Pass detected words + user-selected colors into the extension
    useEffect(() => {
        if (editor) {
            const ext: any = editor.extensionManager.extensions.find((e) => e.name === 'jargonHighlighter');
            if (ext && ext.options) {
                ext.options.getDetectedWords = () => highlighted;
                ext.options.getWordColors = () => userWordColors;
            }
            editor.view.dispatch(editor.state.tr.setMeta('updateJargon', true));
        }
    }, [highlighted, userWordColors, editor]);

    return (
        <div className={cn('w-full relative', className)}>
            <div className="ml-auto text-xs text-muted-foreground mb-6">
                {editor?.getText().length || 0}/{maxLength}
            </div>

            <div className="flex items-center gap-2 rounded-xl border p-2 bg-card shadow-sm">
                <MenuBar editor={editor!} />
            </div>

            <TooltipProvider>
                <div
                    className={cn(
                        'mt-3 min-h-[180px] w-full rounded-2xl border bg-background p-4 outline-none focus:ring-2 ring-ring',
                        'prose prose-sm dark:prose-invert max-w-none',
                    )}
                >
                    <EditorContent editor={editor} />
                </div>
            </TooltipProvider>

            {/* Floating toolbar for left-mouse selection */}
            {selectionMenu.show && (
                <div
                    id="feynman-selection-toolbar"
                    className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 px-2"
                    style={{ left: selectionMenu.x, top: selectionMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-2 pb-2 text-xs font-medium text-gray-600 dark:text-gray-300">Mark as jargon</div>
                    <div className="flex items-center gap-2 px-2 pb-2">
                        {JARGON_COLORS.map((c) => (
                            <button
                                key={c.decorationClass}
                                title={c.name}
                                className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 hover:scale-105 transition"
                                style={{}}
                                onClick={() => handleMarkColor(c.decorationClass)}
                            >
                                <span className={`block w-full h-full rounded-full ${c.previewClass}`} />
                            </button>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                        <button
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 rounded"
                            onClick={handleUnmark}
                        >
                            Remove mark
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-2 text-xs text-muted-foreground">
                Complex words are underlined. Select text to mark it as jargon with a chosen underline color.
            </div>
        </div>
    );
};
