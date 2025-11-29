import { SuggestionProps } from '@tiptap/suggestion';
import { ItemProps, ItemTypeEnum } from '../../components/note/CommandsView';
import { Code, Grid2X2, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Type } from 'lucide-react';
import { RefObject, useMemo } from 'react';

interface Props {
    imageUploadButtonRef: RefObject<HTMLButtonElement>;
}

export type CommandOptionProps = ItemProps & {
    command: (props: SuggestionProps) => void;
};

export default function useCommandOptions({ imageUploadButtonRef }: Props) {
    const options: Omit<CommandOptionProps, 'id'>[] = useMemo(() => {
        return [
            {
                title: 'Text',
                group: ItemTypeEnum.BASIC,
                icon: <Type className="size-4" />,
                command: ({ editor, range }: SuggestionProps) => {
                    editor.chain().focus().deleteRange(range).setParagraph().run();
                },
            },
            {
                // title to filter items
                title: 'Heading 1',
                group: ItemTypeEnum.BASIC,
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
                group: ItemTypeEnum.BASIC,
                icon: <Heading2 className="size-4" />,
                command: ({ editor, range }: SuggestionProps) => {
                    editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
                },
            },
            {
                title: 'Heading 3',
                group: ItemTypeEnum.BASIC,
                icon: <Heading3 className="size-4" />,
                command: ({ editor, range }: SuggestionProps) => {
                    editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
                },
            },
            {
                title: 'Bulleted List',
                group: ItemTypeEnum.BASIC,
                icon: <List className="size-4" />,
                command: ({ editor, range }: SuggestionProps) => {
                    editor.chain().focus().deleteRange(range).toggleBulletList().run();
                },
            },
            {
                title: 'Numbered List',
                group: ItemTypeEnum.BASIC,
                icon: <ListOrdered className="size-4" />,
                command: ({ editor, range }: SuggestionProps) => {
                    editor.chain().focus().deleteRange(range).toggleOrderedList().run();
                },
            },
            {
                title: 'Quote',
                group: ItemTypeEnum.BASIC,
                icon: <Quote className="size-4" />,
                command: ({ editor, range }: SuggestionProps) => {
                    editor.chain().focus().deleteRange(range).setBlockquote().run();
                },
            },
            {
                title: 'Table',
                group: ItemTypeEnum.BASIC,
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
                group: ItemTypeEnum.ADVANCED,
                title: 'Add Image',
                imageUploadButtonRef,
                command: ({ editor, range }: SuggestionProps) => {
                    editor.chain().focus().deleteRange(range).run();
                    imageUploadButtonRef?.current?.click();
                },
            },
            {
                title: 'Code',
                group: ItemTypeEnum.ADVANCED,
                icon: <Code className="size-4" />,
                command: ({ editor, range }: SuggestionProps) => {
                    editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
                },
            },
        ] as Omit<CommandOptionProps, 'id'>[];
    }, [imageUploadButtonRef]);

    const result: CommandOptionProps[] = useMemo(() => {
        return options.map((option, index) => ({
            ...option,
            id: index,
        }));
    }, [options]);

    return { options: result };
}
