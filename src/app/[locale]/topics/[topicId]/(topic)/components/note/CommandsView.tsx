import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { SuggestionProps } from '@tiptap/suggestion';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import commandUtils from '../../utils/command.utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    LIST = 'list',
    ADVANCED = 'advanced',
}
export type ItemType = (typeof ItemTypeEnum)[keyof typeof ItemTypeEnum];
export type ItemProps = ItemBaseProps | ImageItemProps;
export const itemTypes: ItemTypeEnum[] = Object.values(ItemTypeEnum);

// forwardRef to pass ref from parent component to child component
const CommandsView = forwardRef<CommandsViewRef, SuggestionProps<ItemProps, any>>(({ items, command, editor }, ref) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const itemRefs = useRef(new Map<number, HTMLDivElement | null>());
    const [selectedGroup, setSelectedGroup] = useState<ItemType | null>(null);

    useEffect(() => {
        const availableIds = items.map((item) => item.id);
        const firstItemId = availableIds.length > 0 ? availableIds[0] : null;
        setSelectedId(firstItemId);

        itemRefs.current.keys().forEach((itemId) => {
            if (!availableIds.includes(itemId)) itemRefs.current.delete(itemId);
        });
    }, [items]);

    const upHandler = useCallback(() => {
        const currentId = selectedId ?? 0;
        const availableIds = items
            .filter((item) => !selectedGroup || item.group === selectedGroup)
            .map((item) => item.id);
        const currentPos = availableIds.indexOf(currentId);
        const prevPos = currentPos - 1;
        const nextId = prevPos >= 0 ? availableIds[prevPos] : availableIds[availableIds.length - 1];

        setSelectedId(nextId);
        itemRefs.current.get(nextId)?.scrollIntoView();
    }, [items, selectedId, selectedGroup]);

    const downHandler = useCallback(() => {
        const currentId = selectedId ?? 0;
        const availableIds = items
            .filter((item) => !selectedGroup || item.group === selectedGroup)
            .map((item) => item.id);
        const currentPos = availableIds.indexOf(currentId);
        const nextPos = currentPos + 1;
        const nextId = nextPos < availableIds.length ? availableIds[nextPos] : availableIds[0];

        setSelectedId(nextId);
        itemRefs.current.get(nextId)?.scrollIntoView();
    }, [items, selectedId, selectedGroup]);

    const selectItem = useCallback(
        (id: number | null) => {
            const item = items.find((item) => item.id === id);
            if (item) command(item);
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

    function onGroupChange(value: ItemType) {
        if (value === selectedGroup) {
            setSelectedGroup(null);
        } else {
            setSelectedGroup(value);
        }
    }

    useImperativeHandle(ref, () => ({
        onKeyDown,
    }));

    return (
        <Command className="p-1 rounded-lg border shadow-md w-64">
            {/* <CommandInput placeholder="Type a command or search..." /> */}
            <Tabs className="mb-2" value={selectedGroup ?? "none"}>
                <TabsList className="grid grid-cols-4">
                    {itemTypes.map((group) => (
                        <TabsTrigger
                            key={group}
                            value={group}
                            className={`flex justify-center items-center ${group === 'advanced' ? 'col-span-2' : ''}`}
                            onClick={() => onGroupChange(group as ItemType)}
                        >
                            {commandUtils.getDisplayCommandGroupName(group)}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {(selectedGroup ? [selectedGroup] : itemTypes).map((group) => (
                    <CommandGroup key={group} heading={commandUtils.getDisplayCommandGroupName(group)}>
                        {items
                            .filter((item) => item.group === group)
                            .map((item) => (
                                <CommandItem
                                    key={item.id}
                                    ref={(el) => {
                                        itemRefs.current.set(item.id, el);
                                    }}
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
