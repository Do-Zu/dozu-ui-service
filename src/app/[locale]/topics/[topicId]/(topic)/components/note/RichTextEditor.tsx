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
import noteUtils, { MAX_FILE_SIZE } from '../../utils/note.utils';

import { Extension } from '@tiptap/react';
import { Suggestion, SuggestionProps } from '@tiptap/suggestion';
import CommandsView, { CommandsViewRef, ItemProps, ItemTypeEnum } from './CommandsView';
import { computePosition, flip, offset, shift } from '@floating-ui/react';
import { Placeholder } from '@tiptap/extensions';
import Blockquote from '@tiptap/extension-blockquote';
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

// Create a Commands Extension
const createCommandsPlugin = (options: CommandOptionProps[]) =>
    Extension.create({
        name: 'insertMenu', // name of Extension
        addProseMirrorPlugins() {
            return [
                Suggestion<CommandOptionProps>({
                    editor: this.editor, // get editor of context
                    char: '/', // character to trigger this plugin
                    // A function that is called when a suggestion is selected.
                    // the props argument contains title, icon, attributes, & function command of the item
                    // inside this function, the function command (defined inside array of items) will be executed
                    command: ({ editor, range, props }) => {
                        props.command({ editor, range, props });
                    },
                    // list of items that user can use
                    // query (string): characters that user types with trigger (eg. '/heading')
                    // return an array that match the query
                    items: ({ query }) => {
                        return (
                            options
                                // only return items that match with the start of the query
                                .filter((item) => {
                                    return item.title.toLowerCase().startsWith(query.toLowerCase());
                                })
                                // limit to 20 items
                                .slice(0, 20)
                        );
                    },
                    startOfLine: true, // allow only when '/' is typed at the start of the line
                    // component to be rendered on top of the trigger
                    render() {
                        let component: ReactRenderer<ComponentProps<typeof CommandsView>, any>,
                            popup: HTMLDivElement | null = null;
                        return {
                            // triggered when user clicks '/'
                            // this function will initialize component
                            // (create CommandsView component, mount it to popup & parent node of editor instance)
                            // props is an object including editor instance, range, query, text, clientRect (function returns DOMRect) of the suggestion
                            onStart(props) {
                                popup = document.createElement('div');
                                // get parentNode of editor
                                const editorParent = props.editor.view.dom.parentNode as HTMLElement;

                                if (editorParent) {
                                    editorParent.style.position = 'relative';
                                    editorParent.appendChild(popup); // bind popup to editorParent
                                }

                                // use ReactRenderer for tiptap to render React components inside tiptap components
                                component = new ReactRenderer(CommandsView, {
                                    props,
                                    editor: props.editor,
                                }) as ReactRenderer<SuggestionProps<any, any>>;

                                popup.appendChild(component.element);
                                updatePosition(props);
                            },
                            // triggered when user clicks characters after '/' (eg. '/heading')
                            // this function will update props of component, making CommandsView re-render, updating pop-up position
                            onUpdate(props) {
                                component.updateProps(props);
                                updatePosition(props);
                            },
                            // triggered when user clicks shortcuts (eg. Enter, ArrowUp, ArrowDown, etc)
                            onKeyDown({ event }) {
                                if (event.key === 'Escape') {
                                    popup?.remove();
                                    return true;
                                }
                                // call onKeyDown of CommandsView
                                return (component?.ref as CommandsViewRef)?.onKeyDown?.(event) || false;
                            },
                            // triggered when user deletes '/'
                            // this function will remove popup from DOM, unmount CommandsView
                            onExit() {
                                if (popup) {
                                    popup.remove();
                                    popup = null;
                                }
                                component?.destroy();
                            },
                        };

                        async function updatePosition(props: SuggestionProps<any, any>) {
                            if (!popup || !props.clientRect) return;

                            // virtual referenced element, floating UI computes position based on this virual element's position
                            const getBoundingClientRect = (
                                props.clientRect() ? props.clientRect : () => new DOMRect(0, 0, 0, 0)
                            ) as () => DOMRect;

                            // compute position of floating popup, returning x & y
                            const { x, y } = await computePosition(
                                {
                                    getBoundingClientRect,
                                },
                                popup,
                                {
                                    placement: 'bottom-start',
                                    middleware: [offset(6), flip(), shift()],
                                },
                            );
                            // assign computed position to floating popup
                            if (popup) {
                                Object.assign(popup.style, {
                                    position: 'absolute',
                                    left: `${x}px`,
                                    top: `${y}px`,
                                });
                            }
                        }
                    },
                }),
            ];
        },
    });

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
                maxSize: MAX_FILE_SIZE,
            }),
            createCommandsPlugin(options),
            Placeholder.configure({
                placeholder: () => {
                    return "Press '/' to see command list...";
                },
            }),
            Blockquote,
            TableKit.configure({
                table: { resizable: true },
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: cn('min-h-[20vh] border-2 rounded-lg p-6', 'tiptap'),
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
