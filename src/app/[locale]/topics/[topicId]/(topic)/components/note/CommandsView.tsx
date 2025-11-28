import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { SuggestionProps } from '@tiptap/suggestion';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';

export interface CommandsViewRef {
    onKeyDown?: (event: KeyboardEvent) => boolean;
}

interface ItemBaseProps {
    type?: string;
    title: string;
    icon?: JSX.Element;
    attributes?: object;
}

interface ImageItemProps {
    type: 'image';
    title: string;
    icon?: JSX.Element;
    attributes?: object;
    imageUploadButtonRef: React.RefObject<HTMLButtonElement>;
}

export type ItemProps = ItemBaseProps | ImageItemProps;

// forwardRef to pass ref from parent component to child component
const CommandsView = forwardRef<CommandsViewRef, SuggestionProps<ItemProps, any>>(({ items, command, editor }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    useEffect(() => {
        setSelectedIndex(0);
    }, [items]);

    const upHandler = useCallback(() => {
        setSelectedIndex((prev) => {
            const current = prev ?? 0;
            return (current + items.length - 1) % items.length;
        });
    }, [items]);

    const downHandler = useCallback(() => {
        setSelectedIndex((prev) => {
            const current = prev ?? 0;
            return (current + 1) % items.length;
        });
    }, [items]);

    const selectItem = useCallback(
        (index: number | null) => {
            const item = items[index ?? 0];
            if (item) command(item);
            if (item && item.type === 'image') {
                (item as ImageItemProps).imageUploadButtonRef.current?.click();
            }
        },
        [items, command],
    );

    const enterHandler = useCallback(() => {
        selectItem(selectedIndex);
    }, [selectedIndex, selectItem]);

    const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }
            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }
            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }
            return false;
        },
        [upHandler, downHandler, enterHandler],
    );

    useImperativeHandle(ref, () => ({
        onKeyDown,
    }));

    function renderImageUploadButton(item: ImageItemProps) {
        return (
            <ImageUploadButton
                className="w-full h-full"
                editor={editor}
                text={item.title}
                hideWhenUnavailable={true}
                ref={item.imageUploadButtonRef}
            />
        );
    }

    return (
        <Command className="p-1 rounded-lg border shadow-md w-64">
            {/* <CommandInput placeholder="Type a command or search..." /> */}
            <CommandGroup className="space-y-0 p-0">
                {items.map((item, index) => (
                    <CommandItem
                        key={index}
                        onSelect={() => selectItem(index)}
                        {...(item.attributes ?? {})}
                        className={cn(
                            'flex items-center gap-2 p-2 cursor-pointer text-sm aria-selected:bg-accent aria-selected:text-accent-foreground',
                            'rounded-md',
                            index === selectedIndex ? 'bg-accent' : '',
                        )}
                    >
                        {item.type === 'image' ? (
                            renderImageUploadButton(item as ImageItemProps)
                        ) : (
                            <>
                                <span className="w-5 h-5 flex items-center justify-center text-muted-foreground">
                                    {item.icon}
                                </span>
                                <span className="font-medium">{item.title}</span>
                            </>
                        )}
                    </CommandItem>
                ))}
            </CommandGroup>
        </Command>
    );
});

export default CommandsView;
