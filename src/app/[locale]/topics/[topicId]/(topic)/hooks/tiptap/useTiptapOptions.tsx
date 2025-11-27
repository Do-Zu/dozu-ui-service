import { Editor, useEditorState } from '@tiptap/react';
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
    Strikethrough,
    Type,
} from 'lucide-react';
import { useMemo } from 'react';

interface Option {
    icon: React.ReactNode;
    onClick: () => void;
    pressed: boolean;
}

interface Props {
    editor: Editor;
}

export default function useTiptapOptions({ editor }: Props) {
    const {
        isParagraph,
        isHeading1,
        isHeading2,
        isHeading3,
        isBold,
        isItalic,
        isStrike,
        isAlignLeft,
        isAlignCenter,
        isAlignRight,
        isBulletList,
        isOrderedList,
        isHighlight,
    } = useEditorState({
        editor,
        selector(context) {
            return {
                isParagraph: context.editor.isActive('paragraph'),
                isHeading1: context.editor.isActive('heading', { level: 1 }),
                isHeading2: context.editor.isActive('heading', { level: 2 }),
                isHeading3: context.editor.isActive('heading', { level: 3 }),
                isBold: context.editor.isActive('bold'),
                isItalic: context.editor.isActive('italic'),
                isStrike: context.editor.isActive('strike'),
                isAlignLeft: context.editor.isActive({ textAlign: 'left' }),
                isAlignCenter: context.editor.isActive({ textAlign: 'center' }),
                isAlignRight: context.editor.isActive({ textAlign: 'right' }),
                isBulletList: context.editor.isActive('bulletList'),
                isOrderedList: context.editor.isActive('orderedList'),
                isHighlight: context.editor.isActive('highlight'),
            };
        },
    });

    const options: Option[] = useMemo(
        () => [
            {
                icon: <Type className="size-4" />,
                onClick: () => editor.chain().focus().setParagraph().run(),
                pressed: isParagraph,
            },
            {
                icon: <Heading1 className="size-4" />,
                onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                pressed: isHeading1,
            },
            {
                icon: <Heading2 className="size-4" />,
                onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                pressed: isHeading2,
            },
            {
                icon: <Heading3 className="size-4" />,
                onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
                pressed: isHeading3,
            },
            {
                icon: <Bold className="size-4" />,
                onClick: () => editor.chain().focus().toggleBold().run(),
                pressed: isBold,
            },
            {
                icon: <Italic className="size-4" />,
                onClick: () => editor.chain().focus().toggleItalic().run(),
                pressed: isItalic,
            },
            {
                icon: <Strikethrough className="size-4" />,
                onClick: () => editor.chain().focus().toggleStrike().run(),
                pressed: isStrike,
            },
            {
                icon: <AlignLeft className="size-4" />,
                onClick: () => editor.chain().focus().setTextAlign('left').run(),
                pressed: isAlignLeft,
            },
            {
                icon: <AlignCenter className="size-4" />,
                onClick: () => editor.chain().focus().setTextAlign('center').run(),
                pressed: isAlignCenter,
            },
            {
                icon: <AlignRight className="size-4" />,
                onClick: () => editor.chain().focus().setTextAlign('right').run(),
                pressed: isAlignRight,
            },
            {
                icon: <List className="size-4" />,
                onClick: () => editor.chain().focus().toggleBulletList().run(),
                pressed: isBulletList,
            },
            {
                icon: <ListOrdered className="size-4" />,
                onClick: () => editor.chain().focus().toggleOrderedList().run(),
                pressed: isOrderedList,
            },
            {
                icon: <Highlighter className="size-4" />,
                onClick: () => editor.chain().focus().toggleHighlight().run(),
                pressed: isHighlight,
            },
        ],
        [
            isParagraph,
            isHeading1,
            isHeading2,
            isHeading3,
            isBold,
            isItalic,
            isStrike,
            isAlignLeft,
            isAlignCenter,
            isAlignRight,
            isBulletList,
            isOrderedList,
            isHighlight,
        ],
    );

    return { options };
}
