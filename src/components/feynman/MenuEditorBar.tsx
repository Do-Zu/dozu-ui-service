import { Editor, useEditorState } from '@tiptap/react';
import {
    Bold,
    ItalicIcon,
    Strikethrough,
    Code,
    Eraser,
    Trash2,
    Pilcrow,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    List,
    ListOrdered,
    SquareCode,
    Quote,
    Minus,
    CornerDownLeft,
    Undo2,
    Redo2,
} from 'lucide-react';
import { Button } from '../ui/button';
import './styles/Editor.css';

export default function MenuBar({ editor }: { editor: Editor }) {
    const editorState = useEditorState({
        editor,
        selector: (ctx) => ({
            isBold: ctx.editor?.isActive('bold') ?? false,
            canBold: ctx.editor?.can().chain().toggleBold().run() ?? false,
            isItalic: ctx.editor?.isActive('italic') ?? false,
            canItalic: ctx.editor?.can().chain().toggleItalic().run() ?? false,
            isStrike: ctx.editor?.isActive('strike') ?? false,
            canStrike: ctx.editor?.can().chain().toggleStrike().run() ?? false,
            isCode: ctx.editor?.isActive('code') ?? false,
            canCode: ctx.editor?.can().chain().toggleCode().run() ?? false,
            isParagraph: ctx.editor?.isActive('paragraph') ?? false,
            isHeading1: ctx.editor?.isActive('heading', { level: 1 }) ?? false,
            isHeading2: ctx.editor?.isActive('heading', { level: 2 }) ?? false,
            isHeading3: ctx.editor?.isActive('heading', { level: 3 }) ?? false,
            isHeading4: ctx.editor?.isActive('heading', { level: 4 }) ?? false,
            isHeading5: ctx.editor?.isActive('heading', { level: 5 }) ?? false,
            isHeading6: ctx.editor?.isActive('heading', { level: 6 }) ?? false,
            isBulletList: ctx.editor?.isActive('bulletList') ?? false,
            isOrderedList: ctx.editor?.isActive('orderedList') ?? false,
            isCodeBlock: ctx.editor?.isActive('codeBlock') ?? false,
            isBlockquote: ctx.editor?.isActive('blockquote') ?? false,
            canUndo: ctx.editor?.can().chain().undo().run() ?? false,
            canRedo: ctx.editor?.can().chain().redo().run() ?? false,
        }),
    });

    const btnCls = 'h-8 w-8';
    const makeVariant = (active: boolean) => (active ? 'secondary' : 'ghost');

    return (
        <div className="flex flex-wrap gap-1">
            <Button
                size="icon"
                variant={makeVariant(editorState.isBold)}
                className={btnCls}
                disabled={!editorState.canBold}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isItalic)}
                className={btnCls}
                disabled={!editorState.canItalic}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <ItalicIcon className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isStrike)}
                className={btnCls}
                disabled={!editorState.canStrike}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isCode)}
                className={btnCls}
                disabled={!editorState.canCode}
                onClick={() => editor.chain().focus().toggleCode().run()}
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className={btnCls}
                onClick={() => editor.chain().focus().unsetAllMarks().run()}
                title="Clear marks"
            >
                <Eraser className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className={btnCls}
                onClick={() => editor.chain().focus().clearNodes().run()}
                title="Clear nodes"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isParagraph)}
                className={btnCls}
                onClick={() => editor.chain().focus().setParagraph().run()}
            >
                <Pilcrow className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isHeading1)}
                className={btnCls}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isHeading2)}
                className={btnCls}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isHeading3)}
                className={btnCls}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
                <Heading3 className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isHeading4)}
                className={btnCls}
                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            >
                <Heading4 className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isHeading5)}
                className={btnCls}
                onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
            >
                <Heading5 className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isHeading6)}
                className={btnCls}
                onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
            >
                <Heading6 className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isBulletList)}
                className={btnCls}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isOrderedList)}
                className={btnCls}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isCodeBlock)}
                className={btnCls}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
                <SquareCode className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant={makeVariant(editorState.isBlockquote)}
                className={btnCls}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
                <Quote className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className={btnCls}
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal rule"
            >
                <Minus className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className={btnCls}
                onClick={() => editor.chain().focus().setHardBreak().run()}
                title="Hard break"
            >
                <CornerDownLeft className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className={btnCls}
                disabled={!editorState.canUndo}
                onClick={() => editor.chain().focus().undo().run()}
            >
                <Undo2 className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className={btnCls}
                disabled={!editorState.canRedo}
                onClick={() => editor.chain().focus().redo().run()}
            >
                <Redo2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
