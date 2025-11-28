'use client';

import { EditorContent, ReactRenderer, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { ComponentProps, createRef, useEffect } from 'react';
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
import CommandsView, { CommandsViewRef, ItemProps } from './CommandsView';
import { computePosition, flip, offset, shift } from '@floating-ui/react';
import { Grid2X2, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Type } from 'lucide-react';
import { Placeholder } from '@tiptap/extensions';
import Blockquote from '@tiptap/extension-blockquote';
import { TableKit } from '@tiptap/extension-table';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type CommandItemProps = ItemProps & {
    command: (props: SuggestionProps) => void;
};

interface Props {
    content: string;
    onContentChange: (content: string) => void;
    isGenerating?: boolean;
    className?: string;
}

const imageUploadButtonRef = createRef<HTMLButtonElement>();

// Create a Commands Extension
const CommandsPlugin = Extension.create({
    name: 'insertMenu', // name of Extension
    addProseMirrorPlugins() {
        return [
            Suggestion<CommandItemProps>({
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
                        [
                            {
                                title: 'Text',
                                icon: <Type className="size-4" />,
                                command: ({ editor, range }: SuggestionProps) => {
                                    editor.chain().deleteRange(range).setParagraph().run();
                                },
                            },
                            {
                                // title to filter items
                                title: 'Heading 1',
                                icon: <Heading1 className="size-4" />,
                                // class attributes that will bind to element later on
                                attributes: {
                                    'data-test-id': 'insert-heading1',
                                },
                                // function which is triggered when user click the item
                                // range: 'from' index and 'to' index, indicating the start and end position of trigger after clicking
                                // eg. click '/' => { from: 0, to: 1 }; click '/he' => { from: 5, to: 8 }
                                // deleteRange: delete everything in a given range => delete the characters triggering (eg. '/')
                                command: ({ editor, range }: SuggestionProps) => {
                                    editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
                                },
                            },
                            {
                                title: 'Heading 2',
                                icon: <Heading2 className="size-4" />,
                                command: ({ editor, range }: SuggestionProps) => {
                                    editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
                                },
                            },
                            {
                                title: 'Heading 3',
                                icon: <Heading3 className="size-4" />,
                                command: ({ editor, range }: SuggestionProps) => {
                                    editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
                                },
                            },
                            {
                                title: 'Bulleted List',
                                icon: <List className="size-4" />,
                                command: ({ editor, range }: SuggestionProps) => {
                                    editor.chain().focus().deleteRange(range).toggleBulletList().run();
                                },
                            },
                            {
                                title: 'Numbered List',
                                icon: <ListOrdered className="size-4" />,
                                command: ({ editor, range }: SuggestionProps) => {
                                    editor.chain().focus().deleteRange(range).toggleOrderedList().run();
                                },
                            },
                            {
                                title: 'Quote',
                                icon: <Quote className="size-4" />,
                                command: ({ editor, range }: SuggestionProps) => {
                                    editor.chain().focus().deleteRange(range).setBlockquote().run();
                                },
                            },
                            {
                                title: 'Table',
                                icon: <Grid2X2 className="size-4" />,
                                command: ({ editor, range }: SuggestionProps) => {
                                    editor
                                        .chain()
                                        .focus()
                                        .deleteRange(range)
                                        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                                        .run();
                                },
                            },
                            {
                                type: 'image',
                                title: 'Add Image',
                                imageUploadButtonRef,
                                command: ({ editor, range }: SuggestionProps) => {
                                    editor.chain().focus().deleteRange(range).run();
                                },
                            },
                        ]
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
                    toastHelper.showErrorMessage(`Failed to upload image: ${err.message}`);
                },
                maxSize: MAX_FILE_SIZE,
            }),
            CommandsPlugin,
            Placeholder.configure({
                placeholder: "Press '/' to see command list...",
            }),
            Blockquote,
            TableKit.configure({
                table: { resizable: true },
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
