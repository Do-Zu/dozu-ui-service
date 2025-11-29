import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { SuggestionProps } from '@tiptap/suggestion';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import commandUtils from '../../utils/command.utils';

export interface CommandsViewRef {
    onKeyDown?: (event: KeyboardEvent) => boolean;
}

interface ItemBaseProps {
    id: number;
    type?: string;
    group: ItemType;
    title: string;
    icon?: JSX.Element;
    attributes?: object;
}

interface ImageItemProps {
    id: number;
    type: 'image';
    group: ItemType;
    title: string;
    icon?: JSX.Element;
    attributes?: object;
    imageUploadButtonRef: React.RefObject<HTMLButtonElement>;
}

export enum ItemTypeEnum {
    BASIC = 'basic',
    ADVANCED = 'advanced',
}
export type ItemType = (typeof ItemTypeEnum)[keyof typeof ItemTypeEnum];
export type ItemProps = ItemBaseProps | ImageItemProps;
export const itemTypes: ItemTypeEnum[] = Object.values(ItemTypeEnum);

// forwardRef to pass ref from parent component to child component
const CommandsView = forwardRef<CommandsViewRef, SuggestionProps<ItemProps, any>>(({ items, command, editor }, ref) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        const availableIds = items.map((item) => item.id);
        const firstItemId = availableIds.length > 0 ? availableIds[0] : null;
        setSelectedId(firstItemId);
    }, [items]);

    const upHandler = useCallback(() => {
        setSelectedId((prev) => {
            const currentId = prev ?? 0;
            const availableIds = items.map((item) => item.id);
            const currentPos = availableIds.indexOf(currentId);
            const prevPos = currentPos - 1;
            const result = prevPos >= 0 ? availableIds[prevPos] : availableIds[availableIds.length - 1];
            return result;
        });
    }, [items]);

    const downHandler = useCallback(() => {
        setSelectedId((prev) => {
            const currentId = prev ?? 0;
            const availableIds = items.map((item) => item.id);
            const currentPos = availableIds.indexOf(currentId);
            const nextPos = currentPos + 1;
            const result = nextPos < availableIds.length ? availableIds[nextPos] : availableIds[0];
            return result;
        });
    }, [items]);

    const selectItem = useCallback(
        (id: number | null) => {
            const item = items.find((item) => item.id === id);
            if (item) command(item);
            if (item && item.type === 'image') {
                (item as ImageItemProps).imageUploadButtonRef.current?.click();
            }
        },
        [items, command],
    );

    const enterHandler = useCallback(() => {
        selectItem(selectedId);
    }, [selectedId, selectItem]);

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

    return (
        <Command className="p-1 rounded-lg border shadow-md w-64">
            {/* <CommandInput placeholder="Type a command or search..." /> */}
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {itemTypes.map((group) => (
                    <CommandGroup key={group} heading={commandUtils.getDisplayCommandGroupName(group)}>
                        {items
                            .filter((item) => item.group === group)
                            .map((item) => (
                                <CommandItem
                                    key={item.id}
                                    onSelect={() => selectItem(item.id)}
                                    {...(item.attributes ?? {})}
                                    className={cn(
                                        'flex items-center gap-2 p-2 cursor-pointer text-sm aria-selected:bg-accent aria-selected:text-accent-foreground',
                                        'rounded-md',
                                        item.id === selectedId ? 'bg-accent' : '',
                                    )}
                                >
                                    {item.type === 'image' ? (
                                        <ImageUploadButton
                                            className="w-full h-full"
                                            editor={editor}
                                            text={item.title}
                                            hideWhenUnavailable={true}
                                            ref={(item as ImageItemProps).imageUploadButtonRef}
                                        />
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
                ))}
            </CommandList>
        </Command>
    );
});

export default CommandsView;
