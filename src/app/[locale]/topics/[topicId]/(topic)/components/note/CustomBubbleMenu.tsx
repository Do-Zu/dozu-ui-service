import { Editor } from '@tiptap/react';
import { Toggle } from '@/components/ui/toggle';
import { BubbleMenu as BubbleMenuReact } from '@tiptap/react/menus';
import useTiptapOptions from '../../hooks/tiptap/useTiptapOptions';

interface Props {
    editor: Editor;
}

export const CustomBubbleMenu = ({ editor }: Props) => {
    const { options } = useTiptapOptions({ editor });

    return (
        <BubbleMenuReact
            editor={editor}
            options={{ placement: 'top' }}
            className="rounded-md border bg-popover text-popover-foreground shadow-md"
        >
            <div className="flex flex-wrap gap-1 p-1">
                {options.map((option, index) => (
                    <Toggle key={index} pressed={option.pressed} onPressedChange={() => option.onClick()} size="sm">
                        {option.icon}
                    </Toggle>
                ))}
            </div>
        </BubbleMenuReact>
    );
};
